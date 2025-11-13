import { useUser } from "@/context/UserProvider";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import type { Table } from "@tanstack/react-table";
import React, { useRef } from "react";
import { ActionsColumn } from "@/components/dynamic/ActionsColumn";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUEvents } from "./CUEvents";
import type { TEventsData } from "./types/events.types";
import { useModal } from "@/components/dynamic/ModalProvider";
import { AddEvents } from "./AddEvents";

function EventsPage() {
  const userContext = useUser();
  const ModalContext = useModal();

  const tableRef = useRef<Table<TEventsData>>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<TEventsData | null>(null);


  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["eventsData"],
    queryFn: async () => {
      const response = await api.get("/events");
      // console.log(response)
      return response;
    },
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

  const OnClickEdit = async (row: any) => {
    // setEditingEvent(row);
    // setIsSheetOpen(true);
    const result = await ModalContext.showModal(<AddEvents id={row.id} />);
    console.log("User response:", result);

  };
  return (
    <>

      {/* Add Sheet (always visible) */}
      {/* <CUEvents
        trigger="Add Event"
        triggerVariant="default"
        event={editingEvent}
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setEditingEvent(null);
        }}
      /> */}

      <Button
        variant="default"
        size="icon"
        onClick={() => {
          setEditingEvent(null);
          setIsSheetOpen(true);
        }}
        className="w-full"
      >Add Events</Button>

      <DynamicTable1<TEventsData>
        ref={tableRef}
        data={dataArray}
        columnOptions={{ HideColumns: ["id"] }}
      >
        {(row) =>
          <ActionsColumn >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => OnClickEdit(row.original)}
            >
              <SquarePen className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
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
