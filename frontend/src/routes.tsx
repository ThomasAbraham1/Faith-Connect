import {  MembersPage } from "./app/members";

export const appRoutes = {
members:
    {
        path: "/dashboard/members",
        label: "Members",
        element: <MembersPage />,
    }
}