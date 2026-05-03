import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link2,
  Copy,
  ExternalLink,
  Users,
  MessageSquare,
  Loader2,
  Info,
  ToggleLeft,
  ToggleRight,
  User,
  Phone,
  Mail,
  DownloadCloud,
} from 'lucide-react';
import { SendWhatsApp } from '../whatsapp/SendWhatsApp';
import { handleExcelDownload } from '@/lib/utils';
import { FormDesigner } from './FormDesigner';
import { ClipboardEdit } from 'lucide-react';

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ eventId, onBack }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedRegistrants, setSelectedRegistrants] = useState<any[]>([]);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}`);
      return res.data?.data || res.data;
    },
  });

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/registrations`);
      // Interceptor wraps: { data: [...] }, so the array is at res.data.data
      const raw = res.data?.data;
      return Array.isArray(raw) ? raw : [];
    },
    refetchOnWindowFocus: true,
  });

  // Force refetch when switching to the registrants tab
  React.useEffect(() => {
    if (activeTab === 'registrants') {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
    }
  }, [activeTab, eventId, queryClient]);

  const hasRegistrants = (registrations || []).length > 0;

  const toggleRegistrationMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/events/${eventId}`, { registrationOpen: !event?.registrationOpen })
      console.log(response)
      return response.data
    },
    onSuccess: (response) => {
      console.log(response)
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventsData'] });
      if (response.data.registrationOpen) {
        toast.success(response?.data?.message || 'Event registration opened successfully!');
      } else {
        toast.success(response?.data?.message || 'Event registration closed successfully!');
      }
    },
  });

  const registrationUrl = `${window.location.origin}/e/${eventId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast.success('Link copied to clipboard!');
  };

   const downloadExcel = async () => {
    const response = await api.get("/report/registrations?eventId="+eventId, {
      responseType: "blob",
    });
    handleExcelDownload(response, 'registrations.xlsx');
  };

  if (eventLoading || !event) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const populatedRegs = (registrations || []).map((r: any) => r.memberId).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-muted/50 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{event.eventName}</h2>
            <div className="flex items-center gap-3 mt-1">
              {event.eventDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.eventDate).toLocaleDateString()}
                </span>
              )}
              {event.eventLocation && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {event.eventLocation}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-2xl">{event.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-[450px] mb-6">
          <TabsTrigger value="details" className="gap-2">
            <Info className="h-4 w-4" /> Details
          </TabsTrigger>
          <TabsTrigger value="form" className="gap-2">
            <ClipboardEdit className="h-4 w-4" /> Form
          </TabsTrigger>
          <TabsTrigger value="registrants" className="gap-2">
            <Users className="h-4 w-4" /> Registrants
          </TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="mt-0 space-y-4">
          {/* Registration Link Card content... */}


          {/* Registration Link Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Registration Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                <code className="text-xs flex-1 truncate text-muted-foreground">{registrationUrl}</code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => window.open(registrationUrl, '_blank')}>
                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button
                  variant={event.registrationOpen ? 'outline' : 'default'}
                  size="sm"
                  className="gap-2 flex-1"
                  onClick={() => toggleRegistrationMutation.mutate()}
                  disabled={toggleRegistrationMutation.isPending}
                >
                  {event.registrationOpen ? (
                    <><ToggleRight className="h-3.5 w-3.5 text-green-500" /> Open</>
                  ) : (
                    <><ToggleLeft className="h-3.5 w-3.5" /> Closed</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORM DESIGNER TAB */}
        <TabsContent value="form" className="mt-0">
          <FormDesigner event={event} hasRegistrants={hasRegistrants} />
        </TabsContent>

        {/* REGISTRANTS TAB */}
        <TabsContent value="registrants" className="mt-0">
          <Card className="bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 pt-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Registrants
                {registrations && (
                  <Badge variant="secondary">{registrations.length}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Download Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadExcel}
                  className="h-9 px-3 text-xs gap-2"
                >
                  <DownloadCloud className="h-4 w-4" />
                  Export Excel
                </Button>

                {populatedRegs.length > 0 && (
                  <SendWhatsApp
                    triggerContent={<><MessageSquare className="h-4 w-4 mr-1" /> Send WhatsApp</>}
                    triggerVariant="outline"
                    triggerClassName="h-9 px-3 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    phoneNumbers={populatedRegs.map((m: any) => m.phone)}
                    names={populatedRegs.map((m: any) => `${m.firstName} ${m.lastName}`)}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {regsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border/50">
                    {(registrations || []).map((reg: any) => {
                      const m = reg.memberId;
                      // Use responses if memberId is missing (new public registrations)
                      const firstName = m?.firstName || reg.responses?.firstName || reg.responses?.first_name || 'Guest';
                      const lastName = m?.lastName || reg.responses?.lastName || reg.responses?.last_name || '';
                      const phone = m?.phone || reg.responses?.phone || 'N/A';
                      const email = m?.email || reg.responses?.email || '';
                      const profilePic = m?.profilePic?.profilePicPath || '';

                      // Extract custom responses (everything except the fixed ones)
                      const fixedKeys = ['firstName', 'lastName', 'phone', 'email', 'first_name', 'last_name'];
                      const customResponses = Object.entries(reg.responses || {})
                        .filter(([key]) => !fixedKeys.includes(key));

                      return (
                        <div key={reg._id} className="flex flex-col p-4 hover:bg-muted/30 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={profilePic} />
                                <AvatarFallback>
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm">{firstName} {lastName}</p>
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />{phone}
                                  </span>
                                  {email && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Mail className="h-3 w-3" />{email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={reg.source === 'PUBLIC_FORM'
                                ? 'text-xs border-blue-200 text-blue-600 bg-blue-50'
                                : 'text-xs border-muted text-muted-foreground'}
                            >
                              {reg.source === 'PUBLIC_FORM' ? 'Public Form' : 'Admin added'}
                            </Badge>
                          </div>

                          {/* Custom Fields Display */}
                          {customResponses.length > 0 && (
                            <div className="mt-3 ml-14 grid gap-2">
                              {customResponses.map(([key, value]) => (
                                <div key={key} className="flex gap-2 text-xs">
                                  <span className="font-medium text-muted-foreground uppercase tracking-tight">{key.replace(/_/g, ' ')}:</span>
                                  <span className="text-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(!registrations || registrations.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Users className="h-12 w-12 text-muted-foreground/20 mb-2" />
                        <p className="text-muted-foreground text-sm">No registrations yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Share the registration link to start collecting registrations.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
