import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner"; // Assuming sonner is used, based on components/ui/sonner.tsx

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMemberIds: string[];
  onSuccess: () => void;
}

export const ComposeModal = ({
  open,
  onOpenChange,
  selectedMemberIds,
  onSuccess,
}: ComposeModalProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: { memberIds: string[]; subject: string; body: string }) => {
      const response = await api.post("/bulk-email/send", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Emails queued successfully.");
      setSubject("");
      setBody("");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to queue emails.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required.");
      return;
    }
    
    mutation.mutate({
      memberIds: selectedMemberIds,
      subject,
      body,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Bulk Email</DialogTitle>
          <DialogDescription>
            You are sending an email to {selectedMemberIds.length} selected member(s).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              placeholder="Type your message here..."
              className="min-h-[200px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
