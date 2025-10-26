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
import { useEffect, useState } from "react";
import { NavHeader } from "./NavHeader";
import { QueryClient, useQueryClient } from '@tanstack/react-query';

export const AppLayout = () => {
  // const navigation =useNavigation()
  // console.log(navigation.state)
  const navigation = useNavigation();
  const isLoading = navigation.state == "loading";
  // useEffect(() => {
  //   console.log(navigation.state);
  // });
  const queryClient = useQueryClient();
  const [isFetching, setisFetching] = useState(true);

  const getisFetching = () => {
    const queries = queryClient.getQueryCache().getAll();
    return queries.some(query =>
      query.state.fetchStatus === 'fetching'
    );
  };

  useEffect(() => {
    // Update statuses immediately on mount
    setisFetching(getisFetching());

    // Subscribe to query cache updates
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      setisFetching(getisFetching());
    });
    console.log(isFetching)
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [queryClient.getQueryCache().getAll()]);
  
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
            <Outlet></Outlet>
          </>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
