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

  // // Function to get selected row and format them for further processing
  // const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
  //   const selectedRowsObject = value as Record<string, Row<Member>>
  //   const arrayOfIds = Object.values(selectedRowsObject).map((value) => value.original.id)
  //   setSelectedRowIds(arrayOfIds)
  // }, [])

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

  // test
  useEffect(() => {
    if (isMounted.current) { console.log(selectedRowIds) }
    else { isMounted.current = true }
  }, [selectedRowIds])



  // Take admin role ID and compare it with user data to filter members
  const roleName = userContext.church?.roles.find((role) => role.name == "admin")?.name
 
  const tableData: Member[] = React.useMemo(() => {

    return data?.data.data.filter((member: membersResponseObject) => {
      return !member.roles.includes(roleName || '') ? true : false
    }).map(
      (value: membersResponseObject, index: number) => {
        // Find role name for user role IDs
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
      {
        (selectedRowIds.length > 0 && <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
          <Button variant={'destructive'}>Delete</Button>
        </Alert>
        )
        || <AddMembers triggerButtonVariant={'default'} />
      }
      {/* <DataTable
            table={tableCreator<ColumnDef>({ data: data, columns: columns })}
          /> */}
      <DynamicTable1 ref={tableRef} data={tableData} columnOptions={{ HideColumns: ['id'] }}>
        {((row) =>
          <ActionsColumn >
          </ActionsColumn>
        )}
      </DynamicTable1>
    </>
  );
  // }
  // {response && (<Addmember trigger />)}
  // return (
  //   <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
  //     <LoadingSpinner />
  //   </div>
  // );
};
