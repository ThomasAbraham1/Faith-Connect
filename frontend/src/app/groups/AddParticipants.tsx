import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Member } from "@/app/members/types/members.types";
import { Modal } from "@/components/dynamic/Modal";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddParticipantsProps {
  groupId: string;
  type: 'members' | 'leaders';
  trigger: React.ReactNode;
  triggerVariant?: "ghost" | "outline" | "default" | "secondary" | "destructive" | "link";
}

export const AddParticipants: React.FC<AddParticipantsProps> = ({ groupId, type, trigger, triggerVariant = "ghost" }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", "participants"],
    queryFn: async () => {
      const response = await api.get("/members");
      const rawData = response.data.data;
      if (!Array.isArray(rawData)) return [];
      
      return rawData.map((m: any) => ({
        id: m._id,
        userName: m.userName,
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
      }));
    },
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const payload = type === 'members' ? { addMembers: ids } : { addLeaders: ids };
      return api.patch(`/groups/${groupId}/participants`, payload);
    },
    onSuccess: () => {
      toast.success(`${type === 'members' ? 'Members' : 'Leaders'} added successfully`);
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsOpen(false);
      setSelectedIds([]);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to add participants");
    }
  });

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Modal 
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerButtonContent={trigger}
      triggerButtonVariant={triggerVariant}
      modelTitle={`Add ${type === 'members' ? 'Members' : 'Leaders'}`}
      modelDescription="Search and select people to add to this group."
    >
      <div className="space-y-4 pt-4">
        <div className="max-h-[400px] overflow-y-auto border rounded-lg divide-y">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : members?.map((member: any) => (
            <div 
              key={member.id} 
              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                selectedIds.includes(member.id) ? 'bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => handleSelect(member.id)}
            >
              <div>
                <p className="font-semibold">{member.firstName} {member.lastName}</p>
                <p className="text-xs text-muted-foreground">{member.phone}</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedIds.includes(member.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted'
              }`}>
                {selectedIds.includes(member.id) && <div className="h-2 w-2 bg-current rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            disabled={selectedIds.length === 0 || mutation.isPending}
            onClick={() => mutation.mutate(selectedIds)}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add {selectedIds.length} Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
};
