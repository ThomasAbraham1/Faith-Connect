import api from "@/api/api";
import { DataTableDemo } from "@/components/dynamic/DynamicTable";
import LoadingSpinner from "@/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddMembers } from "./AddMembers";
import { Trash2, SquarePen } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/dynamic/Alert";
import { EditMembers } from "./EditMembers";
export const MembersPage = () => {
  // Query
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["membersData"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response;
    },
  });

  // Mutation Function - Delete & Edit
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/members/${id}`),
    onSuccess: (data) =>
      queryClient.invalidateQueries({
        queryKey: ["membersData"],
      }),
  });

  console.log("Hello myu man");
  if (!isPending) {
    // Adhering to Dynamic Table data definition
    const tableData: Member[] = data?.data.map(
      (value: membersResponseObject, index: number) => {
        return {
          id: value._id,
          username: value.userName,
          password: value.password,
          // value.roles.join(","),
        };
      }
    );
    const columns: ColumnDef<Member>[] = [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={
      //         table.getIsAllPageRowsSelected() ||
      //         (table.getIsSomePageRowsSelected() && "indeterminate")
      //       }
      //       onCheckedChange={(value) =>
      //         table.toggleAllPageRowsSelected(!!value)
      //       }
      //       aria-label="Select all"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={row.getIsSelected()}
      //       onCheckedChange={(value) => row.toggleSelected(!!value)}
      //       aria-label="Select row"
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
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
                triggerButtonVariant={"ghost"}
              >
                <SquarePen></SquarePen>
              </EditMembers>
              {row.getValue("actions")}
            </div>
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
    interface membersResponseObject {
      _id: string;
      userName: string;
      password: string;
      roles: string[];
    }

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
          <DataTableDemo data={tableData} columns={columns} />
        </div>
      </>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <LoadingSpinner />
    </div>
  );
};
