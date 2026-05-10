import { SettingsPage } from "./app/admin";
import { Attendance } from "./app/attendance";

import EventsPage from "./app/events";
import { MembersPage } from "./app/members";
import { GroupsPage } from "./app/groups";
import { BulkEmailPage } from "./app/bulk-email";
import { TemplatesPage } from "./app/bulk-email/TemplatesPage";
import { ReportsPage } from "./app/reports";

export const appRoutes = {
    members:
    {
        path: "/dashboard/members",
        label: "Members",
        element: <MembersPage />,
    },
    groups:
    {
        path: "/dashboard/groups",
        label: "Groups",
        element: <GroupsPage />,
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
    },
    reports:
    {
        path: "/dashboard/reports",
        label: "Reports",
        element: <ReportsPage />,
    }
}
