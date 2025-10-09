import api from "@/api/api";
import { DataTableDemo } from "@/components/dynamic/DynamicTable";
import LoadingSpinner from "@/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddMembers } from "./AddMembers";
import { Trash2, SquarePen } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Eye } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/dynamic/Alert";
import { EditMembers } from "./EditMembers";
import { Modal } from "@/components/dynamic/Modal";
import { ViewProfile } from "./ViewProfile";
import { useUser } from "@/context/UserProvider";
interface membersResponseObject {
  _id: string;
  userName: string;
  password: string;
  roles: string[];
  profilePic: {
    profilePicName: string;
    profilePicPath: string;
  };
  phone: string;
  spiritualStatus: string;
  dateOfBirth: string;
  address: string;
  lastName: string;
  firstName: string;
  motherName: string;
  fatherName: string;
}

export const MembersPage = () => {
  const userContext = useUser()
  // Query
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["membersData"],
    queryFn: async () => {
      const response = await api.get("/members");
      console.log(response)
      return response;
    },
  });

  // Mutation Function - Delete & Edit
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/members/${id}`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["membersData"],
      })
    }
  });

  console.log("Hello myu man");
  if (!isPending && !mutation.isPending) {
    // Take admin role ID and compare it with user data to filter members
    const roleName = userContext.church?.roles.find((role) => role.name == "admin")?.name
    console.log('roleName:', data)
    // Removing admins and retrieving members only
    // Adhering to Dynamic Table data definition
    const tableData: Member[] = data?.data.data.filter((member: membersResponseObject) => !member.roles.includes(roleName || '')).map(
      (value: membersResponseObject, index: number) => {
        // Find role name for user role IDs
        var userRoles: string;
        // userRoles = userContext.church?.roles.filter((role) => value.roles.includes(role._id)).map((role) => role.name).join(", ") || "No Role"
        // console.log(userRoles);
        return {
          id: value._id,
          username: value.userName,
          password: value.password,
          phone: value.phone,
          role: value.roles.length > 1 ? value.roles.join(", ") : value.roles[0],
          spiritualStatus: value.spiritualStatus,
          dateOfBirth: value.dateOfBirth,
          firstName: value.firstName,
          lastName: value.lastName,
          fatherName: value.fatherName,
          motherName: value.motherName,
          address: value.address,
          profilePicUrl: `/uploads/${value.profilePic?.profilePicName
            }`,
        };
      }
    ) || [];

    const columns: ColumnDef<Member>[] = [
      {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "username",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Username
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("username")}</div>
        ),
      },
      {
        accessorKey: "password",
        header: () => <div className="text-right">Password</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("password")}
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: () => <div className="text-right">Phone</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("phone")}
            </div>
          );
        },
      },
      {
        accessorKey: "spiritualStatus",
        header: () => <div className="text-right">Spiritual Status</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("spiritualStatus")}
            </div>
          );
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: () => <div className="text-right">Date Of Birth</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("dateOfBirth")}
            </div>
          );
        },
      },
      {
        accessorKey: "profilePicUrl",
        header: () => <div className="text-right">Profile Picture</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("profilePicUrl")}
            </div>
          );
        },
      },
      {
        accessorKey: "firstName",
        header: () => <div className="text-right">First Name</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("firstName")}
            </div>
          );
        },
      },
      {
        accessorKey: "lastName",
        header: () => <div className="text-right">Last Name</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("lastName")}
            </div>
          );
        },
      },
      {
        accessorKey: "fatherName",
        header: () => <div className="text-right">Father's Name</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("fatherName")}
            </div>
          );
        },
      },
      {
        accessorKey: "motherName",
        header: () => <div className="text-right">Mother's Name</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("motherName")}
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: () => <div className="text-right">Address</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("address")}
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: () => <div className="text-right">Role</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium">
              {row.getValue("role")}
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          return (
            // Delete button as icon
            <div className="text-right font-medium">
              <Alert
                onComfirmFunction={() => mutation.mutate(row.getValue("id"))}
              >
                <Button variant={"ghost"}>
                  <Trash2></Trash2>
                </Button>
              </Alert>
              {/* Edit button as icon */}
              <EditMembers
                id={row.getValue("id")}
                userName={row.getValue("username")}
                password={row.getValue("password")}
                dateOfBirth={row.getValue("dateOfBirth")}
                phone={row.getValue("phone")}
                spiritualStatus={row.getValue("spiritualStatus")}
                profilePicUrl={row.getValue("profilePicUrl")}
                roles={row.getValue("role")}
                triggerButtonVariant={"ghost"}
              >
                <SquarePen></SquarePen>
                {/* <Button onClick={async (e) => {
                  const response = await api.get(row.getValue('profilePicUrl'), {
                    responseType: "blob",
                  })
                }}>edit</Button> */}
              </EditMembers>
              {/* View button */}
              <Modal triggerButtonContent={<Eye />} triggerButtonVariant={"ghost"}>
                <ViewProfile userName={row.getValue("username")}
                  dateOfBirth={row.getValue("dateOfBirth")}
                  phone={row.getValue("phone")}
                  address={row.getValue("address")}
                  firstName={row.getValue("firstName")}
                  lastName={row.getValue("lastName")}
                  fatherName={row.getValue("fatherName")}
                  motherName={row.getValue("motherName")}
                  spiritualStatus={row.getValue("spiritualStatus")}
                  profilePicUrl={row.getValue("profilePicUrl")}></ViewProfile>
              </Modal>
            </div >
          );
        },
      },
      // {
      //   id: "actions",
      //   enableHiding: false,
      //   cell: ({ row }) => {
      //     const payment = row.original;

      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger asChild>
      //           <Button variant="ghost" className="h-8 w-8 p-0">
      //             <span className="sr-only">Open menu</span>
      //             <MoreHorizontal />
      //           </Button>
      //         </DropdownMenuTrigger>
      //         <DropdownMenuContent align="end">
      //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
      //           <DropdownMenuItem
      //             onClick={() => navigator.clipboard.writeText(payment.id)}
      //           >
      //             Copy payment ID
      //           </DropdownMenuItem>
      //           <DropdownMenuSeparator />
      //           <DropdownMenuItem>View customer</DropdownMenuItem>
      //           <DropdownMenuItem>View payment details</DropdownMenuItem>
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     );
      //   },
      // },
    ];

    // Members Table Header
    const tableConfig = {
      headerFields: ["Id", "Username", "Password", "Role"],
    };

    // Column Config
    type Member = {
      id: string;
      username: string;
      password: string;
    };

    // type headerFields = ["Id", "Username", "Password", "Role", "Permission"];


    console.log(tableData);

    interface DataTableProps<TData> {
      columns: ColumnDef<TData>[];
      data: TData[];
    }

    return (
      <>
        {/* <DynamicTable
          fetchResponse={{
            isPending: isPending,
            error: error,
            data: tableData,
            isFetching: isFetching,
            }}
            tableConfig={tableConfig}
            ChildComponent={AddMembers}
            /> */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AddMembers triggerButtonVariant={"outline"} />
          {/* <DataTable
            table={tableCreator<ColumnDef>({ data: data, columns: columns })}
          /> */}
          <DataTableDemo data={tableData} columns={columns} columnVisibilityObject={{ profilePicUrl: false, address: false }} />
        </div>
      </>
    );
  }
  // {response && (<Addmember trigger />)}
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <LoadingSpinner />
    </div>
  );
};
