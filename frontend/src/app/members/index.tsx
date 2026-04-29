import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash2, Eye, MessageSquare, Printer } from "lucide-react";
import { SendWhatsApp } from "../whatsapp/SendWhatsApp";
import { FaWhatsapp } from "react-icons/fa";
import { PrintableMembersTable } from "./report/PrintableMembersTable";
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
import { useReactToPrint } from "react-to-print";
import { ViewProfile } from "./ViewProfile";
import type { membersResponseObject, Member } from "./types/members.types";


export const MembersPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const userContext = useUser();
  const tableRef = useRef<TableType<Member>>(null);
  const [selection, setSelection] = useState<{ ids: string[], rows: Member[] }>({ ids: [], rows: [] });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Function to get selected row and format them for further processing
  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<Member>>
    const rows = Object.values(selectedRowsObject).map((val) => val.original);
    const arrayOfIds = rows.map((r) => r.id);
    setSelection({ ids: arrayOfIds as string[], rows });
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
        const roleLabels: Record<string, string> = {
          PRIMARY: 'Head of Family',
          SPOUSE: 'Spouse',
          CHILD: 'Child',
          DEPENDENT: 'Dependent',
        };
        return {
          id: value._id,
          userName: value.userName,
          password: value.password,
          phone: value.phone,
          role: value.roles.length > 1 ? value.roles.join(", ") : value.roles[0],
          spiritualStatus: value.spiritualStatus,
          dateOfBirth: value.dateOfBirth,
          anniversaryDate: value.anniversaryDate,
          household: (value.householdId as any)?.name || '—',
          householdRole: roleLabels[value.householdRole] || value.householdRole || '—',
          rawHouseholdId: (value.householdId as any)?._id || value.householdId,
          rawHouseholdRole: value.householdRole,
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
            <div className={selection.ids.length > 0 ? "flex gap-2" : "hidden"}>
              <Alert onComfirmFunction={() => mutation.mutate(selection.ids)}>
                <Button variant="destructive">Delete Selected</Button>
              </Alert>
              <SendWhatsApp
                triggerContent={
                  <>
                    <FaWhatsapp className="h-4 w-4 mr-2" />
                    Send WhatsApp to Selected
                  </>
                }
                triggerVariant="outline"
                triggerClassName="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                phoneNumbers={selection.rows.map(r => r.phone)}
                names={selection.rows.map(r => `${r.firstName} ${r.lastName}`)}
              />
            </div>

            <div className={selection.ids.length > 0 ? "hidden" : "flex gap-2"}>
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
              <Button
                variant="outline"
                onClick={() => reactToPrintFn()}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Directory
              </Button>
            </div>
          </div>



          <DynamicTable1<Member>
            ref={tableRef}
            data={tableData}
            getSelectedRowsObject={getSelectedRowsObject}
            columnOptions={{
              HideColumns: ["id", "churchId", "profilePicUrl", "address", "password", "fatherName", "motherName", "dateOfBirth", "anniversaryDate", "userName", "rawHouseholdId", "rawHouseholdRole"]
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
                      profilePic: memberData.profilePicUrl,
                      householdId: memberData.rawHouseholdId,
                      householdRole: memberData.rawHouseholdRole,
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
                  triggerContent={<FaWhatsapp className="h-4 w-4" />}
                  triggerVariant="ghost"
                  triggerClassName="text-green-600 hover:text-green-700 hover:bg-green-50/50 h-9 w-9 p-0"
                  phoneNumbers={[row.original.phone]}
                  names={[`${row.original.firstName} ${row.original.lastName}`]}
                />
                <Modal triggerButtonContent={<Eye />} modelTitle={'Profile Information'} modelDescription={'Click on the button below to print the profile information'} triggerButtonVariant={"ghost"}>
                  <ViewProfile memberId={row.original.id}
                    userName={row.getValue("userName")}
                    dateOfBirth={row.original.dateOfBirth}
                    anniversaryDate={row.original.anniversaryDate}
                    phone={row.getValue("phone")}
                    address={row.original.address}
                    firstName={row.getValue("firstName")}
                    lastName={row.getValue("lastName")}
                    email={row.getValue("email")}
                    fatherName={row.original.fatherName}
                    motherName={row.original.motherName}
                    spiritualStatus={row.getValue("spiritualStatus")}
                    churchName={userContext.church?.churchName}
                    profilePicUrl={row.original.profilePicUrl}></ViewProfile>
                </Modal>
              </ActionsColumn>
            }
          </DynamicTable1>
        </CardContent>
      </Card>

      {/* Hidden printable table */}
      <PrintableMembersTable
        ref={contentRef}
        data={tableData as Member[]}
        churchName={userContext.church?.churchName} 
      />
    </div>
  );
};