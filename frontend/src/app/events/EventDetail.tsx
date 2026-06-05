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
import { ClipboardEdit, Eye, Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import { DynamicTable1 } from '@/components/dynamic/DynamicTable1';
import { ActionsColumn } from '@/components/dynamic/ActionsColumn';
import { Modal } from '@/components/dynamic/Modal';
import { Alert } from '@/components/dynamic/Alert';
import { FaWhatsapp } from 'react-icons/fa';
import { type Row } from '@tanstack/react-table';
import { RichEmailComposer } from '@/components/RichEmailComposer';
import { LogViewer } from '@/components/dynamic/LogViewer';
interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ eventId, onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedRegistrants, setSelectedRegistrants] = useState<any[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTargets, setEmailTargets] = useState<{ memberIds: string[], emails: string[] }>({ memberIds: [], emails: [] });


  // Fetching events
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}`);
      // console.log("this is event", res.data.data)
      return res.data?.data || res.data;
    },
  });


  // Fetch registrations
  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/attendees`);
      const raw = res.data?.data;
      // console.log(raw)
      return Array.isArray(raw) ? raw : [];
    },
    refetchOnWindowFocus: true,
  });

  // Fetching batches
  const { data: batchData, isPending: batchesLoading } = useQuery({
    queryKey: ['event-batches', eventId],
    queryFn: async () => {
      const res = await api.get(`/events/${eventId}/batches`);
      const raw = res.data?.data;
      console.log("this is batches", raw)
      return {
        batches: raw?.batches || [],
        emailLogs: raw?.emailLogs || []
      };
    },
    // refetchInterval: 2000,
    refetchOnWindowFocus: true,
  });

  // Force refetch when switching tabs
  React.useEffect(() => {
    if (activeTab === 'registrants') {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
    } else if (activeTab === 'details') {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-batches', eventId] });
    }
  }, [activeTab, eventId, queryClient]);

  const hasRegistrants = (registrations || []).length > 0;

  const toggleRegistrationMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/events/${eventId}`, { registrationOpen: !event?.registrationOpen })
      return response.data
    },
    onSuccess: (response) => {
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (regIds: string[]) => {
      const response = await api.delete(`/events/${eventId}/registrations/${regIds.join(',')}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
      toast.success(data.message || 'Selected registrations deleted successfully!');
      setSelectedRegistrants([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete registrations');
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

  const markUnpaidMutation = useMutation({
    mutationFn: async (regId: string) => {
      const response = await api.patch(`/events/${eventId}/registrations/${regId}/mark-unpaid`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
      toast.success(data.message || 'Registration marked as unpaid!');
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

  const openEmailModal = (registrants: any[]) => {
    // Separate members from raw registrants for the composer
    const memberIds = registrants.filter(r => r.source === 'Group Member').map(r => r.memberId).filter(Boolean);
    const emails = registrants.filter(r => r.source !== 'Group Member').map(r => r.email).filter(Boolean);

    if (memberIds.length === 0 && emails.length === 0) {
      toast.error("No valid email addresses found for selection.");
      return;
    }

    setEmailTargets({ memberIds, emails });
    setIsEmailModalOpen(true);
  };

  const getSelectedRowsObject = React.useCallback((value: Record<string, Row<unknown>> | boolean) => {
    if (typeof value === 'boolean') return;
    const selectedRowsObject = value as Record<string, Row<any>>;
    const rows = Object.values(selectedRowsObject).map((val) => val.original);
    setSelectedRegistrants(rows);
  }, []);

  const tableData = React.useMemo(() => {
    return (registrations || []).map((reg: any) => {
      return {
        id: reg.registrationId || reg.memberId,
        registrationId: reg.registrationId,
        memberId: reg.memberId,
        name: reg.name,
        // firstName: reg.firstName,
        // lastName: reg.lastName,
        phone: reg.phone,
        email: reg.email,
        date: reg.registeredAt,
        paymentStatus: reg.paymentStatus || 'FREE',
        source: reg.source === 'GROUP_MEMBER' ? 'Group Member' : 'Public Form',
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
              {(event.startDate || event.eventDate) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.startDate || event.eventDate).toLocaleDateString()}
                </span>
              )}
              {event.eventLocation && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {event.eventLocation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

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

        <TabsContent value="details" className="mt-0 space-y-4">
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
                For social media (WhatsApp, etc.), use this link instead of copying from your browser's address bar.
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
            {/* Communication Logs Card */}
            <Card className="bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Communication Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {batchesLoading ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading logs...</p>
                ) : batchData?.batches?.length === 0 && batchData?.emailLogs?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No communication logs found for this event.</p>
                ) : (
                  <Tabs defaultValue="batches" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="batches">Batches ({batchData?.batches?.length || 0})</TabsTrigger>
                      <TabsTrigger value="logs">Detailed Logs ({batchData?.emailLogs?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="batches" className="mt-0 space-y-3">
                      <LogViewer
                        data={batchData?.batches || []}
                        searchKeys={['name']}
                        searchPlaceholder="Search batches by name..."
                        itemsPerPage={5}
                        renderItem={(batch: any) => {
                          const logs = batchData?.emailLogs.filter((log: any) => log.batchId === batch._id);
                          const total = logs.length;
                          const sent = logs.filter((log: any) => log.status === 'SENT').length;
                          const failed = logs.filter((log: any) => log.status === 'FAILED').length;
                          const pending = logs.filter((log: any) => log.status === 'PENDING').length;

                          return (
                            <div key={batch._id} className="p-3 rounded-lg border border-border/50 bg-muted/10 flex flex-col gap-2 transition-all hover:bg-muted/30">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate">{batch.name || 'Event Bulk Email'}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {new Date(batch.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs mt-1">
                                <span className="text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border border-border/50">Total: {total}</span>
                                <span className="text-green-500/90 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Sent: {sent}</span>
                                {pending > 0 && <span className="text-yellow-500/90 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full">Pending: {pending}</span>}
                                {failed > 0 && <span className="text-red-500/90 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">Failed: {failed}</span>}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="logs" className="mt-0">
                      <LogViewer
                        data={batchData?.emailLogs || []}
                        searchKeys={['recipientEmail', 'subject', 'status']}
                        searchPlaceholder="Search by email, subject or status..."
                        itemsPerPage={8}
                        renderItem={(log: any) => (
                          <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/20 transition-all gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-sm font-medium text-foreground truncate">{log.recipientEmail}</span>
                              <span className="text-[11px] text-muted-foreground truncate">{log.subject}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {log.status === 'SENT' ? (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">SENT</span>
                              ) : log.status === 'FAILED' ? (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">FAILED</span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">PENDING</span>
                              )}
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

          </Card>

        </TabsContent>

        <TabsContent value="form" className="mt-0">
          <FormDesigner event={event} hasRegistrants={hasRegistrants} />
        </TabsContent>

        <TabsContent value="registrants" className="mt-0">
          <Card className="bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Registrants
                {registrations && (
                  <Badge variant="secondary">{registrations.length}</Badge>
                )}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
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
                  <div className="flex items-center gap-2">
                    <SendWhatsApp
                      triggerContent={<><MessageSquare className="h-4 w-4 mr-1" /> WhatsApp Selected</>}
                      triggerVariant="outline"
                      triggerClassName="h-9 px-3 text-xs border-green-200 text-green-700 hover:bg-green-50"
                      phoneNumbers={selectedRegistrants.map((m: any) => m.phone)}
                      names={selectedRegistrants.map((m: any) => `${m.firstName} ${m.lastName}`)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEmailModal(selectedRegistrants)}
                      className="h-9 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-1" /> Email Selected
                    </Button>
                    <Alert
                      onComfirmFunction={() => {
                        const ids = selectedRegistrants.map(r => r.registrationId).filter(Boolean);
                        if (ids.length > 0) bulkDeleteMutation.mutate(ids);
                        else toast.error("Only public registrations can be deleted.");
                      }}
                      alertTitle="Delete Selected?"
                      alertDescription={`Are you sure you want to delete ${selectedRegistrants.length} registrations? This will only remove public registrants, not invited group members.`}
                    >
                      <Button variant="outline" size="sm" className="h-9 px-3 text-xs border-red-200 text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </Alert>
                  </div>
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
                  columnOptions={{ HideColumns: ['id', 'registrationId', 'memberId'] }}
                >
                  {(row) => (
                    <ActionsColumn>
                      {row.original.registrationId && (
                        <>
                          {row.original.paymentStatus !== 'PAID' ? (
                            <Alert
                              onComfirmFunction={() => markPaidMutation.mutate(row.original.registrationId)}
                              alertTitle="Mark as Paid?"
                              alertDescription="Manually mark as paid? This bypasses the payment gateway."
                            >
                              <Button variant="ghost" size="icon" title="Mark as Paid" className="h-9 w-9 text-green-600 hover:bg-green-50">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </Alert>
                          ) : (
                            <Alert
                              onComfirmFunction={() => markUnpaidMutation.mutate(row.original.registrationId)}
                              alertTitle="Mark as Unpaid?"
                              alertDescription="Set status back to pending?"
                            >
                              <Button variant="ghost" size="icon" title="Mark as Unpaid" className="h-9 w-9 text-orange-600 hover:bg-orange-50">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </Alert>
                          )}
                        </>
                      )}

                      <SendWhatsApp
                        triggerContent={<FaWhatsapp className="h-4 w-4" />}
                        triggerVariant="ghost"
                        triggerClassName="text-green-600 hover:bg-green-50 h-9 w-9 p-0"
                        phoneNumbers={[row.original.phone]}
                        names={[`${row.original.firstName} ${row.original.lastName}`]}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEmailModal([row.original])}
                        className="h-9 w-9 text-blue-600 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>

                      {row.original.registrationId && (
                        <Alert
                          onComfirmFunction={() => deleteRegistrationMutation.mutate(row.original.registrationId)}
                          alertTitle="Delete Registration?"
                          alertDescription="Permanent action. This attendee will be removed."
                        >
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Alert>
                      )}
                      <Modal
                        triggerButtonContent={<Eye className="h-4 w-4" />}
                        modelTitle={'Details'}
                        modelDescription={'View registration data'}
                        triggerButtonVariant={"ghost"}
                        contentClassName="max-w-2xl"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                          {Object.entries(row.original)
                            .filter(([k]) => !['id', 'registrationId', 'memberId'].includes(k))
                            .map(([k, v]) => (
                              <div key={k} className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase">{k.replace(/_/g, ' ')}</p>
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

      {/* Rich Email Modal */}
      <Modal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        modelTitle="Compose Email"
        modelDescription={`Sending to ${emailTargets.memberIds.length + emailTargets.emails.length} recipient(s).`}
        contentClassName="max-w-[90vw] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto"
        triggerClassName="hidden"
      >
        <div className="py-4">
          <RichEmailComposer
            memberIds={emailTargets.memberIds}
            emails={emailTargets.emails}
            eventName={event.eventName}
            eventId={eventId}
            onSuccess={() => setIsEmailModalOpen(false)}
            onCancel={() => setIsEmailModalOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
};
