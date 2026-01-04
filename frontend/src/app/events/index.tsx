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

function EventsPage() {
  const userContext = useUser();
  const tableRef = useRef<TableType<TEventsData>>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<String[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TEventsData | null>(null);

  // Function to get selected row and format them for further processing
  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<TEventsData>>
    const arrayOfIds = Object.values(selectedRowsObject).map((value: any) => value.original.id)
    setSelectedRowIds(arrayOfIds)
  }, [])

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["eventsData"],
    queryFn: async () => {
      const response = await api.get("/events");
      // console.log(response)
      return response;
    },
  });

  // Mutation Function - Delete & Edit
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string | String[]) => {
      console.log(id)
      if (typeof id != 'object') {
        return api.delete(`/events/${id}`)
      }
      return api.delete(`/events/${(id as []).join(',')}`)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["eventsData"],
      })

      // Reseting table selection checks
      if (tableRef.current) {
        tableRef.current.resetRowSelection();
      }
    }
  });

  // if (isFetching) return <div>Loading...</div>;
  // if (error) return <div>Error occurred: {(error as Error).message}</div>;

  let dataArray: TEventsData = data?.data?.data.map((a: any) => ({
    id: a._id,
    eventName: a.eventName,
    eventDate: a.eventDate,
    description: a.description,
    eventLocation: a.eventLocation,
    organizer: a.organizer,
    createdDate: a.createdAt,
  })) || [];

  console.log(editingEvent, 'editingEvent')
  console.log(data?.data?.data, "dataArray");
  return (
    <>
      {selectedRowIds.length > 0 ? (
        <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
          <Button variant="destructive">Delete</Button>
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
      <DynamicTable1<TEventsData>
        ref={tableRef}
        data={dataArray}
        getSelectedRowsObject={getSelectedRowsObject}
        columnOptions={{ HideColumns: ["id"] }}
      >
        {(row) =>
          <ActionsColumn>
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
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </ActionsColumn>
        }
      </DynamicTable1>
    </>
  );
}
export default EventsPage;
