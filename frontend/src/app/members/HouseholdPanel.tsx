import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, X, Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLE_COLORS: Record<string, string> = {
  PRIMARY: 'bg-primary/10 text-primary border-primary/20',
  SPOUSE: 'bg-purple-500/10 text-purple-600 border-purple-200',
  CHILD: 'bg-sky-500/10 text-sky-600 border-sky-200',
  DEPENDENT: 'bg-amber-500/10 text-amber-600 border-amber-200',
};

const ROLE_LABELS: Record<string, string> = {
  PRIMARY: 'Head of Family',
  SPOUSE: 'Spouse',
  CHILD: 'Child',
  DEPENDENT: 'Dependent',
};

interface HouseholdPanelProps {
  memberId: string;
}

export const HouseholdPanel: React.FC<HouseholdPanelProps> = ({ memberId }) => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState('');
  const [selectedRole, setSelectedRole] = useState('SPOUSE');

  // Fetch this member's household (if any)
  const { data: household, isLoading } = useQuery({
    queryKey: ['household', memberId],
    queryFn: async () => {
      const res = await api.get(`/households?memberId=${memberId}`);
      return res.data?.data || null;
    },
  });

  // Fetch all households for the "join existing" picker
  const { data: allHouseholds } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      const res = await api.get('/households');
      return res.data?.data || [];
    },
    enabled: joinOpen,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/households', {
      name: familyName,
      primaryContactId: memberId,
    }),
    onSuccess: () => {
      toast.success('Family created!');
      queryClient.invalidateQueries({ queryKey: ['household', memberId] });
      setCreateOpen(false);
      setFamilyName('');
    },
    onError: () => toast.error('Failed to create family'),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.patch(`/households/${selectedHousehold}/members`, {
      addMembers: [memberId],
    }),
    onSuccess: async () => {
      // Also update the member's householdRole
      await api.patch(`/members/${memberId}`, { householdRole: selectedRole });
      toast.success('Joined family!');
      queryClient.invalidateQueries({ queryKey: ['household', memberId] });
      queryClient.invalidateQueries({ queryKey: ['membersData'] });
      setJoinOpen(false);
    },
    onError: () => toast.error('Failed to join family'),
  });

  const removeMutation = useMutation({
    mutationFn: (targetMemberId: string) =>
      api.patch(`/households/${household._id}/members`, { removeMembers: [targetMemberId] }),
    onSuccess: () => {
      toast.success('Member removed from family');
      queryClient.invalidateQueries({ queryKey: ['household', memberId] });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-background/50 backdrop-blur-xl border-border/50">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // --- NO HOUSEHOLD STATE ---
  if (!household) {
    return (
      <Card className="bg-background/50 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            Household
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center py-2">
            No household assigned.
          </p>

          {/* Create new family */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="w-full gap-2">
                <Home className="h-4 w-4" /> Create Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Family</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Family Name</Label>
                  <Input
                    placeholder="e.g. The Abraham Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This member will be set as the primary contact.
                </p>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!familyName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Family
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Join existing family */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <UserPlus className="h-4 w-4" /> Join Existing Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join an Existing Family</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Select Family</Label>
                  <Select onValueChange={setSelectedHousehold}>
                    <SelectTrigger><SelectValue placeholder="Search families..." /></SelectTrigger>
                    <SelectContent>
                      {(allHouseholds || []).map((h: any) => (
                        <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Role in Family</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SPOUSE">Spouse</SelectItem>
                      <SelectItem value="CHILD">Child</SelectItem>
                      <SelectItem value="DEPENDENT">Dependent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => joinMutation.mutate()}
                  disabled={!selectedHousehold || joinMutation.isPending}
                >
                  {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Join Family
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // --- HAS HOUSEHOLD STATE ---
  return (
    <Card className="bg-background/50 backdrop-blur-xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          {household.name}
        </CardTitle>
        <span className="text-xs text-muted-foreground">{household.members?.length} member(s)</span>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        {(household.members || []).map((member: any) => (
          <div
            key={member._id}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50 group/item relative"
          >
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={member.profilePic?.profilePicPath || ''} />
              <AvatarFallback className="text-xs">
                {member.firstName?.[0]}{member.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {member.firstName} {member.lastName}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1 py-0 ${ROLE_COLORS[member.householdRole] || ''}`}
              >
                {ROLE_LABELS[member.householdRole] || 'Member'}
              </Badge>
            </div>
            {member._id !== memberId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                onClick={() => removeMutation.mutate(member._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        {household.members?.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-2">No members yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
