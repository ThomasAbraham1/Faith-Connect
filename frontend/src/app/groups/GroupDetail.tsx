import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Group } from "./types/groups.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ArrowLeft, User, Phone, CheckCircle2, Settings, Trash2, UserPlus, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CUGroup } from "./CUGroup";
import { AddParticipants } from "./AddParticipants";
import { FinancialsView } from "./FinancialsView";
import { useBreadcrumbs } from "@/context/BreadcrumbProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, IndianRupee, Landmark, Plus, FileText, Download, Wallet } from "lucide-react";
import { SendWhatsApp } from "../whatsapp/SendWhatsApp";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const queryClient = useQueryClient();
  const { setLabel } = useBreadcrumbs();
  const [activeTab, setActiveTab] = React.useState("roster");

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const response = await api.get(`/groups/${groupId}`);
      console.log("GROUP", response)
      const data = response.data.data as Group;
      if (data) {
        setLabel(groupId, data.name);
      }
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/groups/${groupId}`),
    onSuccess: () => {
      toast.success("Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onBack();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (data: { ids: string[]; type: "members" | "leaders" }) => {
      const payload = data.type === "members" ? { removeMembers: data.ids } : { removeLeaders: data.ids };
      return api.patch(`/groups/${groupId}/participants`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success("Participant removed");
    },
  });

  if (isLoading || !group) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-muted/50 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {group.category}
              </Badge>
              <span className="text-xs text-muted-foreground">• Created {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{group.name}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <CUGroup 
            id={group._id} 
            trigger="Edit" 
            triggerVariant="outline" 
            defaultValues={{ name: group.name, category: group.category }} 
          />
          
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={() => {
              if (confirm("Are you sure you want to delete this group?")) deleteMutation.mutate();
            }}
            className="h-9 w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
 
          <SendWhatsApp 
            trigger={
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 group h-9 px-3 text-xs md:text-sm">
                <MessageSquare className="h-4 w-4 mr-1 md:mr-2 group-hover:scale-110 transition-transform" />
                Send WhatsApp
              </Button>
            }
            phoneNumbers={[...group.leaders, ...group.members].map(m => m.phone)}
            names={[...group.leaders, ...group.members].map(m => `${m.firstName} ${m.lastName}`)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {group.category === 'MINISTRY' && (
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
            <TabsTrigger value="roster" className="gap-2">
              <UsersIcon className="h-4 w-4" /> Roster
            </TabsTrigger>
            <TabsTrigger value="financials" className="gap-2">
              <Landmark className="h-4 w-4" /> Financials
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="roster" className="mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Sidebar Info */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-background/50 backdrop-blur-xl border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Leaders
                  </CardTitle>
                  <AddParticipants 
                    groupId={group._id} 
                    type="leaders" 
                    triggerVariant="ghost"
                    trigger={<UserPlus className="h-4 w-4" />} 
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.leaders.map((leader) => (
                    <div key={leader._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 group/item relative">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={leader.profilePicUrl || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {leader.firstName} {leader.lastName}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-2 w-2" />
                          {leader.phone}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={() => removeMutation.mutate({ ids: [leader._id], type: "leaders" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {group.leaders.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No leaders assigned.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <User className="h-24 w-24" />
                </div>
                <CardContent className="pt-6 relative">
                  <div className="text-4xl font-black tracking-tighter text-primary">{group.members.length}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Total Members</div>
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <Card className="md:col-span-2 bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20 pt-4 flex flex-row items-end justify-between">
                <CardTitle className="text-lg">Group Members</CardTitle>
                <AddParticipants 
                  groupId={group._id} 
                  type="members" 
                  triggerVariant="outline"
                  trigger={<><UserPlus className="h-4 w-4 mr-2" /> Add Member</>} 
                />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border/50">
                    {group.members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-background group-hover:scale-105 transition-transform">
                            <AvatarImage src={member.profilePicUrl || ""} />
                            <AvatarFallback>
                              <User className="h-6 w-6 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-base">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => removeMutation.mutate({ ids: [member._id], type: "members" })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {group.members.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <User className="h-12 w-12 text-muted-foreground/20 mb-2" />
                        <p className="text-muted-foreground">No members in this group yet.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-0">
          <FinancialsView group={group} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
