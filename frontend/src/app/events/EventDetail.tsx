import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
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
  FileBarChart2,
} from 'lucide-react';
import { SendWhatsApp } from '../whatsapp/SendWhatsApp';
import { FormDesigner } from './FormDesigner';
import { ClipboardEdit, Eye, Trash2, CheckCircle } from 'lucide-react';
import { DynamicTable1 } from '@/components/dynamic/DynamicTable1';
import { ActionsColumn } from '@/components/dynamic/ActionsColumn';
import { Modal } from '@/components/dynamic/Modal';
import { Alert } from '@/components/dynamic/Alert';
import { FaWhatsapp } from 'react-icons/fa';
import { type Row } from '@tanstack/react-table';

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ eventId, onBack }) => {
  const navigate = useNavigate();
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

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (regId: string) => {
      const response = await api.delete(`/events/${eventId}/registrations/${regId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
      toast.success(data.message || 'Registration deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete registration');
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: async (regId: string) => {
      const response = await api.patch(`/events/${eventId}/registrations/${regId}/mark-paid`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
      toast.success(data.message || 'Registration marked as paid manually!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  let apiBase = import.meta.env.VITE_APP_API_URL || '';
  if (apiBase.startsWith('/')) {
    apiBase = `${window.location.origin}${apiBase}`;
  } else if (!apiBase) {
    apiBase = window.location.origin;
  }
  const registrationUrl = `${apiBase}/share/e/${eventId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast.success('Link copied to clipboard!');
  };



  const getSelectedRowsObject = React.useCallback((value: Record<string, Row<unknown>> | boolean) => {
    if (typeof value === 'boolean') return;
    const selectedRowsObject = value as Record<string, Row<any>>;
    const rows = Object.values(selectedRowsObject).map((val) => val.original);
    setSelectedRegistrants(rows);
  }, []);

  const tableData = React.useMemo(() => {
    return (registrations || []).map((reg: any) => {
      const m = reg.memberId;
      const firstName = m?.firstName || reg.responses?.firstName || reg.responses?.first_name || 'Guest';
      const lastName = m?.lastName || reg.responses?.lastName || reg.responses?.last_name || '';
      const phone = m?.phone || reg.responses?.phone || 'N/A';
      const email = m?.email || reg.responses?.email || '';

      const fixedKeys = ['firstName', 'lastName', 'phone', 'email', 'first_name', 'last_name'];
      const customResponses = Object.entries(reg.responses || {})
        .filter(([key]) => !fixedKeys.includes(key))
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});

      return {
        id: reg._id,
        firstName,
        lastName,
        phone,
        email,
        paymentStatus: reg.paymentStatus || 'FREE',
        source: reg.source === 'PUBLIC_FORM' ? 'Public Form' : 'Admin added',
        ...customResponses
      };
    });
  }, [registrations]);

  if (eventLoading || !event) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                <Info className="h-3 w-3 text-primary/60" />
                For social media (WhatsApp, etc.), use this link instead of copying from your browser's address bar to ensure preview cards display correctly.
              </p>
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
                  onClick={() => navigate(`/dashboard/reports?type=registrations&eventId=${eventId}`)}
                  className="h-9 px-3 text-xs gap-2"
                >
                  <FileBarChart2 className="h-4 w-4" />
                  Full Report
                </Button>

                {selectedRegistrants.length > 0 && (
                  <SendWhatsApp
                    triggerContent={<><MessageSquare className="h-4 w-4 mr-1" /> WhatsApp Selected</>}
                    triggerVariant="outline"
                    triggerClassName="h-9 px-3 text-xs border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    phoneNumbers={selectedRegistrants.map((m: any) => m.phone)}
                    names={selectedRegistrants.map((m: any) => `${m.firstName} ${m.lastName}`)}
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
                <DynamicTable1<any>
                  data={tableData}
                  getSelectedRowsObject={getSelectedRowsObject}
                  columnOptions={{ HideColumns: ['id'] }}
                >
                  {(row) => (
                    <ActionsColumn>
                      {row.original.paymentStatus !== 'PAID' && (
                        <Alert 
                          onComfirmFunction={() => markPaidMutation.mutate(row.original.id)}
                          title="Mark as Paid?"
                          description="Are you sure you want to manually mark this registration as paid? This action bypasses the payment gateway."
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Mark as Paid"
                            className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50/50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </Alert>
                      )}
                      <SendWhatsApp
                        triggerContent={<FaWhatsapp className="h-4 w-4" />}
                        triggerVariant="ghost"
                        triggerClassName="text-green-600 hover:text-green-700 hover:bg-green-50/50 h-9 w-9 p-0"
                        phoneNumbers={[row.original.phone]}
                        names={[`${row.original.firstName} ${row.original.lastName}`]}
                      />
                      <Alert onComfirmFunction={() => deleteRegistrationMutation.mutate(row.original.id)}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50/50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Alert>
                      <Modal 
                        triggerButtonContent={<Eye className="h-4 w-4" />} 
                        modelTitle={'Registration Details'} 
                        modelDescription={'View all details for this registration'} 
                        triggerButtonVariant={"ghost"}
                        contentClassName="max-w-2xl w-[95vw] sm:w-[90vw]"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                          {Object.entries(row.original)
                            .filter(([k]) => k !== 'id')
                            .map(([k, v]) => (
                              <div key={k} className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{k.replace(/_/g, ' ')}</p>
                                <p className="text-sm font-medium">{String(v) || '—'}</p>
                              </div>
                            ))}
                        </div>
                      </Modal>
                    </ActionsColumn>
                  )}
                </DynamicTable1>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
