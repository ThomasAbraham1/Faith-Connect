import React, { useCallback, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import { Users, Send } from "lucide-react";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { useUser } from "@/context/UserProvider";
import { RichEmailComposer } from "@/components/RichEmailComposer";
import type { membersResponseObject, Member } from "../members/types/members.types";

export const BulkEmailPage = () => {
  const userContext = useUser();
  const tableRef = useRef<TableType<Member>>(null);

  // State
  const [activeTab, setActiveTab] = useState("recipients");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Fetch Members
  const { data: membersData } = useQuery({
    queryKey: ["membersDataForEmail"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response;
    },
  });

  // Map members for table
  const roleName = userContext.church?.roles.find((role) => role.name === "admin")?.name;
  const tableData: Member[] = useMemo(() => {
    return membersData?.data.data.filter((member: membersResponseObject) => {
      return !member.roles.includes(roleName || '') ? true : false;
    }).map((value: membersResponseObject) => ({
      id: value._id,
      userName: value.userName,
      password: value.password,
      phone: value.phone,
      email: value.email || "",
      role: value.roles.length > 1 ? value.roles.join(", ") : value.roles[0],
      spiritualStatus: value.spiritualStatus,
      dateOfBirth: value.dateOfBirth,
      firstName: value.firstName,
      lastName: value.lastName,
      fatherName: value.fatherName,
      motherName: value.motherName,
      address: value.address,
      profilePicUrl: `/uploads/${value.profilePic?.profilePicName}`,
    })) || [];
  }, [membersData, roleName]);

  const getSelectedRowsObject = useCallback((value: Record<string, Row<Member>> | boolean) => {
    if (typeof value === 'object') {
      const arrayOfIds = Object.values(value).map((val) => val.original.id);
      setSelectedRowIds(arrayOfIds);

      // Save raw selection state for TanStack table persistence
      const rawSelection: Record<string, boolean> = {};
      Object.keys(value).forEach(key => {
        rawSelection[key] = true;
      });
      setRowSelection(rawSelection);
    }
  }, []);

  const handleSendSuccess = () => {
    if (tableRef.current) tableRef.current.resetRowSelection();
    setSelectedRowIds([]);
    setRowSelection({});
    setActiveTab("recipients");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bulk Email</h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          Send personalized rich-text emails to your church members.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="recipients" className="gap-2">
            <Users className="h-4 w-4" /> Recipients ({selectedRowIds.length})
          </TabsTrigger>
          <TabsTrigger value="compose" className="gap-2">
            <Send className="h-4 w-4" /> Compose & Send
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipients" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Select Members</CardTitle>
                <CardDescription>Choose who will receive this email blast.</CardDescription>
              </div>
              {selectedRowIds.length > 0 && (
                <Button onClick={() => setActiveTab("compose")} variant="default">
                  Next: Compose Message
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <DynamicTable1<Member>
                ref={tableRef}
                data={tableData}
                getSelectedRowsObject={getSelectedRowsObject}
                initialRowSelection={rowSelection}
                columnOptions={{ HideColumns: ["id", "profilePicUrl", "password", "address"] }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="mt-6 space-y-4">
          <RichEmailComposer 
            memberIds={selectedRowIds} 
            onSuccess={handleSendSuccess} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

