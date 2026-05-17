import { useUser } from "@/context/UserProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import React, { useCallback, useRef, useState } from "react";
import api from "@/api/api";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { ActionsColumn } from "@/components/dynamic/ActionsColumn";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUEvents } from "./CUEvents";
import type { TEventsData } from "./types/events.types";
import { Alert } from "@/components/dynamic/Alert";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListIcon } from "lucide-react";
import { CalendarView } from "./CalendarView";
import { toast } from "sonner";

function EventsPage() {
  const userContext = useUser();
  const tableRef = useRef<TableType<TEventsData>>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<String[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TEventsData | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<TEventsData>>
    const arrayOfIds = Object.values(selectedRowsObject).map((value: any) => value.original._id || value.original.id)
    setSelectedRowIds(arrayOfIds)
  }, [])

  const { isPending, error, data } = useQuery({
    queryKey: ["eventsData"],
    queryFn: async () => {
      const response = await api.get("/events");
      return response;
    },
  });

  const mutation = useMutation({
    mutationFn: async (id: string | String[]) => {
      if (typeof id != 'object') {
        return api.delete(`/events/${id}`)
      }
      return api.delete(`/events/${(id as []).join(',')}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsData"] })
      toast.success("Event(s) deleted successfully");
      if (tableRef.current) {
        tableRef.current.resetRowSelection();
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      return api.patch(`/events/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsData"] });
      toast.success("Event updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event");
    }
  });

  const dataArray = React.useMemo(() => {
    const raw = data?.data?.data || data?.data || [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  }, [data]);

  if (isPending) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error loading events: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Events</h2>
        <p className="text-muted-foreground text-sm">
          Manage your church events.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="calendar" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="h-4 w-4" /> Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <ListIcon className="h-4 w-4" /> List View
                </TabsTrigger>
              </TabsList>

              <div>
                {selectedRowIds.length > 0 ? (
                  <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
                    <Button variant="destructive">Delete Selected</Button>
                  </Alert>
                ) : (
                  <CUEvents
                    trigger="Add Event"
                    triggerVariant="default"
                    open={isSheetOpen}
                    onOpenChange={(open: boolean) => {
                      setIsSheetOpen(open);
                      if (!open) setEditingEvent(null);
                    }}
                    onSuccess={() => {
                      setIsSheetOpen(false);
                      setEditingEvent(null);
                    }}
                    data={editingEvent}
                  />
                )}
              </div>
            </div>

            <TabsContent value="calendar" className="mt-0">
              <CalendarView 
                events={dataArray} 
                onSelectEvent={(event) => {
                  setEditingEvent(event);
                  setIsSheetOpen(true);
                }}
                onSelectSlot={(slotInfo) => {
                  const isAllDaySelection = slotInfo.start.getHours() === 0 && slotInfo.start.getMinutes() === 0;
                  
                  const formatTime = (date: Date) => {
                    return date.toTimeString().slice(0, 5);
                  };

                  const editingObj: any = {
                    startDate: slotInfo.start,
                  };

                  if (isAllDaySelection) {
                    // Check if it's a multi-day selection
                    const durationMs = slotInfo.end.getTime() - slotInfo.start.getTime();
                    if (durationMs > 24 * 60 * 60 * 1000) {
                      editingObj.endDate = new Date(slotInfo.end.getTime() - 1000); // inclusive
                    }
                  } else {
                    editingObj.startTime = formatTime(slotInfo.start);
                    editingObj.endTime = formatTime(slotInfo.end);
                  }
                  
                  setEditingEvent(editingObj);
                  setIsSheetOpen(true);
                }}
                onEventUpdate={(id, updates) => updateMutation.mutate({ id, updates })}
                onDeleteEvent={(id) => mutation.mutate(id)}
                onViewRegistrants={(id) => navigate(`/dashboard/Events/${id}/registrations`)}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <DynamicTable1<any>
                ref={tableRef}
                data={dataArray}
                getSelectedRowsObject={getSelectedRowsObject}
                columnOptions={{
                  HideColumns: ["id", "churchId", "_id", "formFields"]
                }}
              >
                {(row) =>
                  <ActionsColumn>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/Events/${row.original._id || row.original.id}/registrations`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingEvent(row.original);
                        setIsSheetOpen(true);
                      }}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>

                    <Alert onComfirmFunction={() => mutation.mutate((row.original._id || row.original.id) as string)}>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Alert>
                  </ActionsColumn>
                }
              </DynamicTable1>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
export default EventsPage;
