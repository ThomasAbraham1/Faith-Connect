import { SettingsPage } from "./app/admin";
import { Attendance } from "./app/attendance";
import { EventCalendar } from "./app/calendar";
import EventsPage from "./app/events";
import { MembersPage } from "./app/members";

export const appRoutes = {
    members:
    {
        path: "/dashboard/members",
        label: "Members",
        element: <MembersPage />,
    },
    attendance:
    {
        path: "/dashboard/attendance",
        label: "Attendance",
        element: <Attendance />,
    },
    settings:
    {
        path: "/dashboard/settings",
        label: "Settings",
        element: <SettingsPage />,
    },
    calendar:
    {
        path: "/dashboard/calendar",
        label: "Calendar",
        element: <EventCalendar />,
    },
    events:
    {
        path: "/dashboard/events",
        label: "Events",
        element: <EventsPage />,
    }
}
