import { useUser } from "@/context/UserProvider";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import type { Table } from "@tanstack/react-table";
import { useRef } from "react";
import { ActionsColumn } from "@/components/dynamic/ActionsColumn";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";


function EventsPage() {
  const userContext = useUser()
  const tableRef = useRef<Table<unknown>>(null);

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["eventsData"],
    queryFn: async () => {
      const response = await api.get("/events");
      // console.log(response)
      return response;
    },
  });
  if (isFetching) return <div>Loading...</div>
  if (error) return <div>Error occurred: {(error as Error).message}</div>
  if (!isFetching) {
    console.log(data?.data?.data, 'events data');
    let dataArray = data?.data?.data.map((a: any) => ({
      eventName: a.eventName,
      eventDate: a.eventDate,
      description: a.description,
      eventLocation: a.eventLocation,
      organizer: a.organizer,
      createdDate: a.createdAt,
    }));
    return (
      <DynamicTable1 ref={tableRef} data={dataArray}
      // columnOptions={{ HideColumns: ["_id"] }}
      >
        <ActionsColumn >
          <Button variant={"ghost"}>
          <SquarePen></SquarePen>
          </Button>
          <Button variant={"ghost"} >
          <Trash2></Trash2>
          </Button>
          {/* <Button variant={"ghost"}>
          <Eye></Eye>
          </Button> */}
        </ActionsColumn>
      </DynamicTable1>
    );
  }
}
export default EventsPage;
