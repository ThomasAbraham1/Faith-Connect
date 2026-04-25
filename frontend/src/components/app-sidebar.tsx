import * as React from "react";
import _ from "lodash";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  Users,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  CalendarCheck2,
  Mail,
  Layout
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";

import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { appRoutes } from "@/routes";
import { useUser } from "@/context/UserProvider";


// This is sample data.
// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
//   navMain: [
//     {
//       title: "Platform",
//       url: "/dashboard",
//       icon: SquareTerminal,
//       isActive: true,
//       items: [
//         {
//           title: "Dashboard",
//           url: "/dashboard",
//         },
//         {
//           title: "Settings",
//           url: appRoutes.settings.path,
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: appRoutes.members.label,
//       url: appRoutes.members.path,
//       icon: Users,
//     },
//     {
//       name: appRoutes.attendance.label,
//       url: appRoutes.attendance.path,
//       icon: CalendarCheck2,
//     },
//     {
//       name: appRoutes.events.label,
//       url: appRoutes.events.path,
//       icon: CalendarCheck2,
//     },
//     {
//       name: appRoutes.bulkEmail.label,
//       url: appRoutes.bulkEmail.path,
//       icon: Mail,
//     },
//     {
//       name: appRoutes.templates.label,
//       url: appRoutes.templates.path,
//       icon: Layout,
//     },
//     {
//       name: appRoutes.calendar.label,
//       url: appRoutes.calendar.path,
//       icon: CalendarCheck2,
//     },
//     // {
//     //   name: "Sales & Marketing",
//     //   url: "#",
//     //   icon: PieChart,
//     // },
//     // {
//     //   name: "Travel",
//     //   url: "#", 
//     //   icon: Map, 
//     // },
//   ],
// };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userContext = useUser()
  const { church, setChurch } = useUser();

  React.useEffect(() => {
    console.log(church?.logo)
  }, [church])

  const teamLogo = church?.logo
    ? (church.logo.startsWith('http') ? church.logo : `/uploads/${church.logo}`)
    : GalleryVerticalEnd;

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: _.startCase(church?.churchName || "Faith Connect"),
        logo: teamLogo,
        plan: "Church",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Platform",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/dashboard",
          },
          {
            title: "Settings",
            url: appRoutes.settings.path,
          },
        ],
      },
    ],
    projects: [
      {
        name: appRoutes.members.label,
        url: appRoutes.members.path,
        icon: Users,
      },
      {
        name: appRoutes.groups.label,
        url: appRoutes.groups.path,
        icon: Users,
      },
      {
        name: appRoutes.attendance.label,
        url: appRoutes.attendance.path,
        icon: CalendarCheck2,
      },
      {
        name: appRoutes.events.label,
        url: appRoutes.events.path,
        icon: CalendarCheck2,
      },
      {
        name: appRoutes.bulkEmail.label,
        url: appRoutes.bulkEmail.path,
        icon: Mail,
      },
      {
        name: appRoutes.templates.label,
        url: appRoutes.templates.path,
        icon: Layout,
      },
      // {
      //   name: "Sales & Marketing",
      //   url: "#",
      //   icon: PieChart,
      // },
      // {
      //   name: "Travel",
      //   url: "#", 
      //   icon: Map, 
      // },
    ],
  };
  data.user.email = church?.email || "";
  data.user.name = _.startCase(userContext?.user?.userName || "");
  data.teams[0]
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
