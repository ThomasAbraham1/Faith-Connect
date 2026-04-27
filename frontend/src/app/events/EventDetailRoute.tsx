import { useParams, useNavigate } from "react-router-dom";
import { EventDetail } from "./EventDetail";

export function EventDetailRoute() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  if (!eventId) return <div>Invalid event ID</div>;

  return (
    <div className="space-y-6">
      <EventDetail 
        eventId={eventId} 
        onBack={() => navigate('/dashboard/Events')} 
      />
    </div>
  );
}
