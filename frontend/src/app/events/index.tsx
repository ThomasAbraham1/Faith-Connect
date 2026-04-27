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
import { EventDetail } from "./EventDetail";

function EventsPage() {
  const userContext = useUser();
  const tableRef = useRef<TableType<TEventsData>>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<String[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TEventsData | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<TEventsData>>
    const arrayOfIds = Object.values(selectedRowsObject).map((value: any) => value.original.id)
    setSelectedRowIds(arrayOfIds)
  }, [])

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["eventsData"],
    queryFn: async () => {
      const response = await api.get("/events");
      return response;
    },
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string | String[]) => {
      if (typeof id != 'object') {
        return api.delete(`/events/${id}`)
      }
      return api.delete(`/events/${(id as []).join(',')}`)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["eventsData"] })
      if (tableRef.current) {
        tableRef.current.resetRowSelection();
      }
    }
  });

  const dataArray = React.useMemo(() => {
    const raw = data?.data?.data || data?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // --- Event Detail view ---
  if (selectedEventId) {
    return <EventDetail eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />;
  }

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
          <div className="flex justify-between items-center mb-4">
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
          <DynamicTable1<any>
            ref={tableRef}
            data={dataArray}
            getSelectedRowsObject={getSelectedRowsObject}
            columnOptions={{
              HideColumns: ["id", "churchId", "_id"]
            }}
          >
            {(row) =>
              <ActionsColumn>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEventId(row.original._id || row.original.id)}
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

                <Alert onComfirmFunction={() => mutation.mutate(row.original.id || "")}>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Alert>
              </ActionsColumn>
            }
          </DynamicTable1>
        </CardContent>
      </Card>
    </div>
  );
}
export default EventsPage;
