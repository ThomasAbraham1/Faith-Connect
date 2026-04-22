import React, { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import { MailPlus } from "lucide-react";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserProvider";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { ComposeModal } from "./ComposeModal";
import type { membersResponseObject, Member } from "../members/types/members.types";

export const BulkEmailPage = () => {
  const userContext = useUser();
  const tableRef = useRef<TableType<Member>>(null);
  
  // State for selections and modal
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract selected rows
  const getSelectedRowsObject = useCallback((value: Record<string, Row<unknown>> | boolean) => {
    const selectedRowsObject = value as Record<string, Row<Member>>;
    const arrayOfIds = Object.values(selectedRowsObject).map((val) => val.original.id);
    setSelectedRowIds(arrayOfIds);
  }, []);

  // Fetch Members Data
  const { data } = useQuery({
    queryKey: ["membersDataForEmail"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response;
    },
  });

  // Filter and map members data
  const roleName = userContext.church?.roles.find((role) => role.name === "admin")?.name;
  
  const tableData: Member[] = React.useMemo(() => {
    return data?.data.data.filter((member: membersResponseObject) => {
      // Typically we exclude admins, following the MembersPage logic, but you can adjust.
      return !member.roles.includes(roleName || '') ? true : false;
    }).map((value: membersResponseObject) => {
      return {
        id: value._id,
        userName: value.userName,
        password: value.password,
        phone: value.phone,
        email: value.email || "", // Fallback if they don't have one
        role: value.roles.length > 1 ? value.roles.join(", ") : value.roles[0],
        spiritualStatus: value.spiritualStatus,
        dateOfBirth: value.dateOfBirth,
        firstName: value.firstName,
        lastName: value.lastName,
        fatherName: value.fatherName,
        motherName: value.motherName,
        address: value.address,
        profilePicUrl: `/uploads/${value.profilePic?.profilePicName}`,
      };
    }) || [];
  }, [data, roleName]);

  const handleSuccess = () => {
    if (tableRef.current) {
      tableRef.current.resetRowSelection();
    }
    setSelectedRowIds([]);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bulk Email</h2>
          <p className="text-muted-foreground text-sm">
            Select members from the table below and click Compose to send them an email.
          </p>
        </div>
        
        {/* Only show the Compose button if at least one row is selected */}
        {selectedRowIds.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <MailPlus className="h-4 w-4" />
            Compose ({selectedRowIds.length})
          </Button>
        )}
      </div>

      <ComposeModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        selectedMemberIds={selectedRowIds}
        onSuccess={handleSuccess}
      />

      {/* Reusing existing DynamicTable1 component structure */}
      <DynamicTable1<Member> 
        ref={tableRef} 
        data={tableData} 
        getSelectedRowsObject={getSelectedRowsObject} 
        columnOptions={{ HideColumns: ["id", "profilePicUrl", "password", "address"] }} 
      />
    </>
  );
};
