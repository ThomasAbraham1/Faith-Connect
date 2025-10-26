import { useUser } from "@/context/UserProvider";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";


function EventsPage() {
  const userContext = useUser()
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
    return (<h1>Hello World! 1</h1>);
  }
}
export default EventsPage;
