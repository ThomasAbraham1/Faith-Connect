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
import { Link, useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";
export const NavHeader = () => {
  const location = useLocation();
  const locationArray = location.pathname.split("/");
  //   removing the empty value in the first index of locationArray
  locationArray.shift();
  // Test location array
  // const locationArray = ['dashboard', 'monkey','sanjau', 'sakthi']
  // console.log(locationArray);
  var locationString: string = "";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {/* Display navigation history and goback links */}

        <Breadcrumb>
          <BreadcrumbList>
            {locationArray.map((location, index) => {
              locationString += `/${location}`;
              // Capitalizing the first letter of location string
              location = location.charAt(0).toUpperCase() + location.slice(1);
              if (index != locationArray.length - 1) {
                return (
                  <Fragment key={index}>
                    <BreadcrumbItem key={index} className="hidden md:block">
                    <Link to={locationString}>
                      {/* <BreadcrumbLink> */}
                        {location}
                      {/* </BreadcrumbLink> */}
                    </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </Fragment>
                );
              }
              locationString = "";
              return (
                <BreadcrumbItem key={index} className="hidden md:block">
                  <BreadcrumbPage>{location}</BreadcrumbPage>
                </BreadcrumbItem>
              );
            })}
            {/* <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem> */}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};
