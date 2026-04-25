import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { Modal } from "@/components/dynamic/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface LogExpenseProps {
  groupId: string;
  onSuccess?: () => void;
}

export const LogExpense: React.FC<LogExpenseProps> = ({ groupId, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("groupId", groupId);
      formData.append("amount", amount);
      formData.append("description", description);
      if (file) {
        formData.append("receipt", file);
      }
      return api.post("/expenses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Expense logged successfully");
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["summary-stats"] });
      setIsOpen(false);
      setAmount("");
      setDescription("");
      setFile(null);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to log expense");
    },
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerButtonContent={<><Plus className="h-4 w-4 mr-2" /> Log Expense</>}
      triggerButtonVariant="default"
      modelTitle="Log New Expense"
      modelDescription="Enter the details of the expense and upload a receipt if available."
    >
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Sunday School Supplies"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt">Receipt (Optional)</Label>
          <Input
            id="receipt"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!amount || !description || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Expense
          </Button>
        </div>
      </div>
    </Modal>
  );
};
