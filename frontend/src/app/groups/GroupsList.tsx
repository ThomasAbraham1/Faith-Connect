import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import type { Group, GroupCategory } from "./types/groups.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Briefcase, ChevronRight, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useParams } from 'react-router-dom';
import { CUGroup } from "./CUGroup";

interface GroupsListProps {
  onGroupClick: (group: Group) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({ onGroupClick }) => {
  const [category, setCategory] = React.useState<GroupCategory>("REGION");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const { category: URLcategory } = useParams();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", category],
    queryFn: async () => {
      const response = await api.get(`/groups?category=${category}`);
      return response.data.data as Group[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Groups</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and organize your congregation into regions and ministries.
          </p>
        </div>
        <CUGroup 
          trigger="Add Group" 
          open={isCreateOpen} 
          onOpenChange={setIsCreateOpen}
        />
      </div>

      <Tabs defaultValue="REGION" className="w-full" onValueChange={(v) => setCategory(v as GroupCategory)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger value="REGION" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regions
          </TabsTrigger>
          <TabsTrigger value="MINISTRY" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Ministries
          </TabsTrigger>
        </TabsList>

        <TabsContent value={category} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl bg-muted/20" />
              ))}
            </div>
          ) : groups?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No groups found in this category.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups?.map((group) => (
                <Card 
                  key={group._id} 
                  className="group relative overflow-hidden cursor-pointer border-border/50 bg-background/50 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                  onClick={() => onGroupClick(group)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-md">
                        {group.category}
                      </Badge>
                      <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-bold mt-4 tracking-tight">
                      {group.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {group.leaders.slice(0, 3).map((leader, i) => (
                            <div 
                              key={leader._id} 
                              className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
                            >
                              {leader.profilePicUrl ? (
                                <img src={leader.profilePicUrl} alt={leader.userName} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                          {group.leaders.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              +{group.leaders.length - 3}
                            </div>
                          )}
                          {group.leaders.length === 0 && (
                            <div className="text-xs text-muted-foreground italic">No leaders assigned</div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {group.leaders.length} {group.leaders.length === 1 ? 'Leader' : 'Leaders'}
                        </span>
                      </div>

                      <div className="h-[1px] w-full bg-gradient-to-r from-border/50 via-border/10 to-transparent" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{group.members.length} Members</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
