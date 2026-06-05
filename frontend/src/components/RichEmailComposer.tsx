import React, { useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Layout, Info } from "lucide-react";
import JoditEditor from 'jodit-react';
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
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

interface RichEmailComposerProps {
  memberIds?: string[];
  emails?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
  eventName?: string; // Optional context for subject
  eventId?: string;
}

export const RichEmailComposer = ({
  memberIds = [],
  emails = [],
  onSuccess,
  onCancel,
  eventName,
  eventId,
}: RichEmailComposerProps) => {
  const navigate = useNavigate();
  const editor = useRef<any>(null);
  const [subject, setSubject] = useState(eventName ? `Update regarding ${eventName}` : "");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const recipientCount = memberIds.length + emails.length;

  // Fetch Templates locally within the component
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
    mutationFn: async (payload: { memberIds?: string[]; emails?: string[]; subject: string; body: string; eventId?: string}) => {
      const response = await api.post("/bulk-email/send", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Emails queued successfully!");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send emails.");
    },
  });

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t._id === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSend = () => {
    if (recipientCount === 0) {
      toast.error("No recipients selected.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and message are required.");
      return;
    }
    sendMutation.mutate({
      memberIds: memberIds.length > 0 ? memberIds : undefined,
      emails: emails.length > 0 ? emails : undefined,
      subject,
      body,
      eventId
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-none shadow-none lg:border lg:shadow-sm">
          <CardHeader className="px-0 lg:px-6">
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Craft your message. Dynamic variables will be replaced for each member recipient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0 lg:px-6">
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
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <Label>Message Body</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Insert:</span>
                  <div className="flex gap-1 flex-wrap">
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
        <Card className="border-none shadow-none lg:border lg:shadow-sm">
          <CardHeader className="px-0 lg:px-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layout className="h-4 w-4" /> Saved Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 lg:px-6">
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

        <Card className="border-none shadow-none lg:border lg:shadow-sm">
          <CardHeader className="px-0 lg:px-6">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 lg:px-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recipients:</span>
              <span className="font-medium text-right">{recipientCount} total</span>
            </div>
            {emails.length > 0 && memberIds.length > 0 && (
              <div className="text-[10px] text-muted-foreground flex flex-col items-end gap-0.5">
                <span>{memberIds.length} Members</span>
                <span>{emails.length} Guests</span>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-md">
              <div className="flex gap-2 text-blue-700">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Placeholder variables (like Name) will only work for existing church members.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full gap-2 h-11 text-lg font-semibold"
                onClick={handleSend}
                disabled={sendMutation.isPending || recipientCount === 0}
              >
                <Send className="h-4 w-4" />
                {sendMutation.isPending ? "Sending..." : `Send Email`}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={sendMutation.isPending}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
