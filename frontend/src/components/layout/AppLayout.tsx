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
import { Outlet, useNavigation, useLocation } from "react-router";
import LoadingSpinner from "../spinner";
import { useEffect, useState } from "react";
import { NavHeader } from "./NavHeader";
import { useIsFetching } from '@tanstack/react-query';

export const AppLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigating = navigation.state == "loading";
  const isFetching = useIsFetching();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <NavHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <>
            {isFetching ?
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                <LoadingSpinner />
              </div> : <></>
            }
            <div key={location.pathname} className="animate-in fade-in duration-500 h-full">
              <Outlet></Outlet>
            </div>
          </>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
