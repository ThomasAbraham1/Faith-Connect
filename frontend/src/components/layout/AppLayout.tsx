import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useNavigation } from "react-router";
import LoadingSpinner from "../spinner";
import { useEffect } from "react";
import { NavHeader } from "./NavHeader";

export const AppLayout = () => {
  // const navigation =useNavigation()
  // console.log(navigation.state)
  const navigation = useNavigation();
  const isLoading = navigation.state == "loading";
  // useEffect(() => {
  //   console.log(navigation.state);
  // });
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <NavHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet></Outlet>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
