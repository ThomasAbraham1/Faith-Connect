import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, SquarePen, Eye } from "lucide-react";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import React, { useCallback, useRef, useState } from "react";

// In your component
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/dynamic/Alert";

import { useUser } from "@/context/UserProvider";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { ActionsColumn } from "@/components/dynamic/ActionsColumn";
import { CUMembers } from "./CUMembers";
import { Modal } from "@/components/dynamic/Modal";
import { ViewProfile } from "./ViewProfile";
import type { membersResponseObject, Member } from "./types/members.types";


export const MembersPage = () => {
  const userContext = useUser();
  const tableRef = useRef<TableType<Member>>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<String[]>([])
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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


  // Take admin role ID and compare it with user data to filter members
  const roleName = userContext.church?.roles.find((role) => role.name == "admin")?.name
  // Removing admins and retrieving members only
  // Adhering to Dynamic Table data definition
  const tableData: Member[] = React.useMemo(() => {

    return data?.data.data.filter((member: membersResponseObject) => {
      // console.log('member.roles:', member.roles, 'roleName:', roleName)
      return !member.roles.includes(roleName || '') ? true : false
    }).map(
      (value: membersResponseObject, index: number) => {
        // Find role name for user role IDs
        console.log(value)
        var userRoles: string;
        return {
          id: value._id,
          userName: value.userName,
          password: value.password,
          phone: value.phone,
          role: value.roles.length > 1 ? value.roles.join(", ") : value.roles[0],
          spiritualStatus: value.spiritualStatus,
          dateOfBirth: value.dateOfBirth,
          firstName: value.firstName,
          email: value.email,
          lastName: value.lastName,
          fatherName: value.fatherName,
          motherName: value.motherName,
          address: value.address,
          profilePicUrl: `/uploads/${value.profilePic?.profilePicName}`,
        };
      }
    ) || [];
  }, [data, roleName])

  return (
    <>
      {selectedRowIds.length > 0 ? (
        <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
          <Button variant="destructive">Delete</Button>
        </Alert>
      ) : (
        <CUMembers
          trigger="Add Member"
          triggerVariant="default"
          open={isSheetOpen}
          onOpenChange={(open: boolean) => {
            setIsSheetOpen(open);
            if (!open) setEditingMember(null);
          }}
          data={editingMember as any}
        />
      )
      }
      <DynamicTable1<Member> ref={tableRef} data={tableData} getSelectedRowsObject={getSelectedRowsObject} columnOptions={{ HideColumns: ["id", 'profilePicUrl', 'address'] }}>
        {(row) =>
          <ActionsColumn>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const memberData = row.original as Member;
                const mappedMember = {
                  ...memberData,
                  roles: memberData.role,
                  profilePic: memberData.profilePicUrl
                };
                setEditingMember(mappedMember as any);
                setIsSheetOpen(true);
              }}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
            <Alert onComfirmFunction={() => mutation.mutate(row.original.id)}>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </Alert>
            <Modal triggerButtonContent={<Eye />} modelTitle={'Profile Information'} modelDescription={'Click on the button below to print the profile information'} triggerButtonVariant={"ghost"}>
              <ViewProfile userName={row.getValue("username")}
                dateOfBirth={row.getValue("dateOfBirth")}
                phone={row.getValue("phone")}
                address={row.getValue("address")}
                firstName={row.getValue("firstName")}
                lastName={row.getValue("lastName")}
                email={row.getValue("email")}
                fatherName={row.getValue("fatherName")}
                motherName={row.getValue("motherName")}
                spiritualStatus={row.getValue("spiritualStatus")}
                churchName={userContext.church?.churchName}
                profilePicUrl={row.getValue("profilePicUrl")}></ViewProfile>
            </Modal>
          </ActionsColumn>
        }
      </DynamicTable1>
    </>
  );
};