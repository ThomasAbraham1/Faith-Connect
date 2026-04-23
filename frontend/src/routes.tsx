import { SettingsPage } from "./app/admin";
import { Attendance } from "./app/attendance";

import EventsPage from "./app/events";
import { MembersPage } from "./app/members";
import { BulkEmailPage } from "./app/bulk-email";
import { TemplatesPage } from "./app/bulk-email/TemplatesPage";

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
    events:
    {
        path: "/dashboard/events",
        label: "Events",
        element: <EventsPage />,
    },
    bulkEmail:
    {
        path: "/dashboard/bulk-email",
        label: "bulk-email",
        element: <BulkEmailPage />,
    },
    templates:
    {
        path: "/dashboard/templates",
        label: "Templates",
        element: <TemplatesPage />,
    }
}
