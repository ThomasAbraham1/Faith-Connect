import React, { useCallback, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Row, type Table as TableType } from "@tanstack/react-table";
import { Mail, Users, Send, Layout, Info } from "lucide-react";
import JoditEditor from 'jodit-react';
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";
import { useUser } from "@/context/UserProvider";
import { toast } from "sonner";
import type { membersResponseObject, Member } from "../members/types/members.types";
interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  churchId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const editorConfig = {
  readonly: false,
  height: 400,
  toolbarAdaptive: false,
  buttons: [
    'bold', 'italic', 'underline', '|',
    'ul', 'ol', '|',
    'font', 'fontsize', 'brush', '|',
    'align', 'undo', 'redo', '|',
    'hr', 'link', 'fullsize',
  ],
};

const placeholders = [
  { label: 'First Name', value: '{{firstName}}' },
  { label: 'Last Name', value: '{{lastName}}' },
  { label: 'User Name', value: '{{userName}}' },
  { label: 'Email', value: '{{email}}' },
];

export const BulkEmailPage = () => {
  const navigate = useNavigate();
  const userContext = useUser();
  const tableRef = useRef<TableType<Member>>(null);
  const editor = useRef<any>(null);

  // State
  const [activeTab, setActiveTab] = useState("recipients");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Fetch Members
  const { data: membersData } = useQuery({
    queryKey: ["membersDataForEmail"],
    queryFn: async () => {
      const response = await api.get("/members");
      return response;
    },
  });

  // Fetch Templates
  const { data: templatesData } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await api.get('/templates');
      return response.data.data;
    },
  });
  const templates = templatesData || [];

  // Send Mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: { memberIds: string[]; subject: string; body: string }) => {
      const response = await api.post("/bulk-email/send", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Emails queued successfully!");
      if (tableRef.current) tableRef.current.resetRowSelection();
      setSelectedRowIds([]);
      setSubject("");
      setBody("");
      setActiveTab("recipients");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send emails.");
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

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t._id === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSend = () => {
    if (selectedRowIds.length === 0) {
      toast.error("Please select at least one recipient.");
      setActiveTab("recipients");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and message are required.");
      return;
    }
    sendMutation.mutate({
      memberIds: selectedRowIds,
      subject,
      body,
    });
  };

  const insertPlaceholder = (value: string) => {
    if (editor.current) {
      editor.current.focus();
      editor.current.execCommand('inserthtml', false, value);
    } else {
      setBody(prev => prev + value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bulk Email</h2>
        <p className="text-muted-foreground text-sm">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                  <CardDescription>
                    Craft your message. Dynamic variables will be replaced for each recipient.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      placeholder="Enter subject..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Message Body</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Insert:</span>
                        <div className="flex gap-1">
                          {placeholders.map((p) => (
                            <Button
                              key={p.value}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 text-[9px] px-1.5"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertPlaceholder(p.value)}
                            >
                              {p.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <JoditEditor
                        ref={editor}
                        value={body}
                        config={editorConfig}
                        onBlur={(newContent) => setBody(newContent)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Template Selection & Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layout className="h-4 w-4" /> Saved Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select a Template</Label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.map((t: any) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.name}
                          </SelectItem>
                        ))}
                        {templates?.length === 0 && (
                          <div className="p-2 text-xs text-center text-muted-foreground">No templates found.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" className="w-full text-xs text-blue-600 h-8" onClick={() => navigate('/dashboard/templates')}>
                    Manage Templates →
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="font-medium">{selectedRowIds.length} members</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-md">
                    <div className="flex gap-2 text-blue-700">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        Every recipient will receive a personalized version of this email with their own name and details.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2 h-11 text-lg font-semibold"
                    onClick={handleSend}
                    disabled={sendMutation.isPending || selectedRowIds.length === 0}
                  >
                    <Send className="h-4 w-4" />
                    {sendMutation.isPending ? "Sending..." : `Send to ${selectedRowIds.length} Members`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
