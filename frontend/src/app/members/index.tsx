import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash2, Eye, MessageSquare } from "lucide-react";
import { SendWhatsApp } from "../whatsapp/SendWhatsApp";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import React, { useCallback, useRef, useState } from "react";

// In your component
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/dynamic/Alert";
import { Card, CardContent } from "@/components/ui/card";

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
  const [selectedRows, setSelectedRows] = useState<Member[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to get selected row and format them for further processing
  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<Member>>
    const rows = Object.values(selectedRowsObject).map((val) => val.original);
    const arrayOfIds = rows.map((r) => r.id);
    setSelectedRowIds(arrayOfIds);
    setSelectedRows(rows);
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
          profilePicUrl: value.profilePic?.profilePicPath?.startsWith('http') 
            ? value.profilePic.profilePicPath 
            : `/uploads/${value.profilePic?.profilePicName}`,
        };
      }
    ) || [];
  }, [data, roleName])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Members</h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          Manage your church members.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            {selectedRowIds.length > 0 ? (
              <div className="flex gap-2">
                <Alert onComfirmFunction={() => mutation.mutate(selectedRowIds)}>
                  <Button variant="destructive">Delete Selected</Button>
                </Alert>
                <SendWhatsApp 
                  trigger={
                    <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send WhatsApp to Selected
                    </Button>
                  }
                  phoneNumbers={selectedRows.map(r => r.phone)}
                  names={selectedRows.map(r => `${r.firstName} ${r.lastName}`)}
                />
              </div>
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
            )}
          </div>
          <DynamicTable1<Member>
            ref={tableRef}
            data={tableData}
            getSelectedRowsObject={getSelectedRowsObject}
            columnOptions={{
              HideColumns: ["id", "churchId", "profilePicUrl", "address", "password", "fatherName", "motherName", "dateOfBirth"]
            }}
          >
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
                <SendWhatsApp 
                  trigger={
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50/50">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  }
                  phoneNumbers={[row.original.phone]}
                  names={[`${row.original.firstName} ${row.original.lastName}`]}
                />
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
        </CardContent>
      </Card>
    </div>
  );
};