import api from "@/api/api";
import { DataTableDemo } from "@/components/dynamic/DynamicTable";
import LoadingSpinner from "@/components/spinner";
import { QueryClientContext, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddMembers } from "./AddMembers";
import { Trash2, SquarePen, CheckCheck, CheckCheckIcon, CheckIcon, CheckSquare, Check } from "lucide-react";
import { type ColumnDef, type Row, type Table as TableType } from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Eye } from 'lucide-react';
// In your component
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/dynamic/Alert";
import { EditMembers } from "./EditMembers";
import { Modal } from "@/components/dynamic/Modal";
import { ViewProfile } from "./ViewProfile";
import { useUser } from "@/context/UserProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { ActionsColumn } from "@/components/dynamic/ActionsColumn";
import { CUEvents } from "./CUEvents";
import { CardTitle } from '@/components/ui/card';
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

// Column Config
export type Member = {
  id: string;
  username: string;
  password: string;
};

export const MembersPage = () => {
  const userContext = useUser();
  const tableRef = useRef<TableType<unknown>>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<String[]>([])
  const isMounted = useRef(false);

  // Function to get selected row and format them for further processing
  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<Member>>
    const arrayOfIds = Object.values(selectedRowsObject).map((value) => value.original.id)
    setSelectedRowIds(arrayOfIds)
  }, [])

  // Query
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["membersData"],
    queryFn: async () => {
      const response = await api.get("/members");
      // console.log(response)
      return response;
    },
  });

  // Mutation Function - Delete & Edit
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string | String[]) => {
      if (typeof id != 'object') {
        return api.delete(`/members/${id}`)
      }
      return api.delete(`/members/${(id as []).join(',')}`)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["membersData"],
      })


      // Reseting table selection checks
      if (tableRef.current) {
        tableRef.current.resetRowSelection();
      }
    }
  });




  // console.log("Hello myu man");
  // if (!isPending && !mutation.isPending) {
  // Take admin role ID and compare it with user data to filter members
  const roleName = userContext.church?.roles.find((role) => role.name == "admin")?.name
  // console.log('roleName:', data)
  // Removing admins and retrieving members only
  // Adhering to Dynamic Table data definition
  const tableData: Member[] = React.useMemo(() => {

    return data?.data.data.filter((member: membersResponseObject) => {
      // console.log('member.roles:', member.roles, 'roleName:', roleName)
      return !member.roles.includes(roleName || '') ? true : false
    }).map(
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
  }, [data, roleName])




  return (
    <>
      {/* {(isFetching || mutation.isPending) &&
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <LoadingSpinner />
        </div>
      } */}
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
      {
        (selectedRowIds.length > 0 && <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
          <Button variant={'destructive'}>Delete</Button>
        </Alert>
        )
        ||
        < CUEvents
          trigger="Add Member"
          triggerVariant="default"
        />
      }
      <DynamicTable1 ref={tableRef} data={tableData} getSelectedRowsObject={getSelectedRowsObject} columnOptions={{ HideColumns: ["id", 'profilePicUrl', 'address'] }}>
        {(row) =>
          <ActionsColumn>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // setEditingEvent(row.original);
                // setIsSheetOpen(true);
              }}
            >
              <SquarePen className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </ActionsColumn>
        }
      </DynamicTable1>
    </>
  );
};
