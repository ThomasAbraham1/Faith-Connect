import api from "@/api/api"
import { Modal } from "@/components/dynamic/Modal"
import LoadingSpinner from "@/components/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useState } from 'react';
import { toast } from "sonner"
import { SignatureCard } from "@/components/dynamic/DynamicSignatureCard"
import { HouseholdPanel } from "./HouseholdPanel"
import {
  Phone, Mail, MapPin, Calendar, User2, Heart, Users, Home, Cake, Star, Printer, Loader2
} from "lucide-react"

const SPIRITUAL_STATUS_COLOR: Record<string, string> = {
  BELIEVER: 'bg-green-500/10 text-green-700 border-green-200',
  NON_BELIEVER: 'bg-slate-500/10 text-slate-600 border-slate-200',
  SEEKER: 'bg-blue-500/10 text-blue-600 border-blue-200',
  UNDECIDED: 'bg-amber-500/10 text-amber-600 border-amber-200',
};

const InfoRow = ({ icon: Icon, label, value, subValue }: { icon: any; label: string; value?: string | null; subValue?: string }) => {
  if (!value && !subValue) return null;
  return (
    <div className="flex items-center gap-4 py-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="h-5 w-5 text-primary/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value || 'Not provided'}</p>
        {subValue && <p className="text-[10px] text-muted-foreground mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
};

export const ViewProfile = ({ memberId, userName, profilePicUrl, phone, churchName, spiritualStatus, dateOfBirth, address, fatherName, motherName, lastName, firstName, email, anniversaryDate }: any) => {
  const [userId, setUserId] = useState(undefined)

  const { data, error, isPending } = useQuery({
    queryKey: ['pastorSignature'],
    queryFn: async () => {
      const result = await api.get('/members/settings/signature')
      if (result) {
        setUserId(result.data.data._id)
      }
      return result
    },
    retry: false
  });

  const queryClient = useQueryClient()

  const signatureMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (userId)
        data.append('userId', userId);
      else
        throw 'User ID is not set'
      return await api.post('/members/settings/signature', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastorSignature'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.data?.message || 'Failed to save signature');
    },
  })

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'NA';
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const statusColor = SPIRITUAL_STATUS_COLOR[spiritualStatus] || 'bg-muted text-muted-foreground border-border';

  return (
    <>
      <div className="print:hidden w-full max-w-2xl mx-auto flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="space-y-6 pr-2">
          {/* ── MODERN HERO HEADER ── */}
          <div className=" relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
              {/* Profile Image with Ring */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-95" />
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-2xl relative z-10">
                  <AvatarImage
                    src={profilePicUrl?.startsWith('http') ? profilePicUrl : `${import.meta.env.VITE_APP_API_URL}${profilePicUrl}`}
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name & Quick Info */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground">{fullName}</h2>
                  <p className="text-primary/70 font-medium tracking-wide">@{userName}</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  {spiritualStatus && (
                    <Badge variant="outline" className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                      <Star className="h-3 w-3 mr-1.5 fill-current" />
                      {spiritualStatus}
                    </Badge>
                  )}
                  {churchName && (
                    <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/50 border-border/50 text-muted-foreground">
                      <Home className="h-3 w-3 mr-1.5" />
                      {churchName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── CONTENT GRID ── */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-2xl h-14 border border-border/30">
              <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 gap-2 font-bold text-xs uppercase tracking-wider">
                <User2 className="h-4 w-4" /> Member Details
              </TabsTrigger>
              <TabsTrigger value="family" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 gap-2 font-bold text-xs uppercase tracking-wider">
                <Users className="h-4 w-4" /> Family Circle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 animate-in slide-in-from-bottom-4 duration-500 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info Card */}
                <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl">
                  <div className="p-4 bg-muted/20 border-b border-border/20">
                    <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                       <Phone className="h-3 w-3" /> Contact Information
                    </h3>
                  </div>
                  <CardContent className="p-4 space-y-1 divide-y divide-border/10">
                    <InfoRow icon={Phone} label="Primary Contact" value={phone} />
                    <InfoRow icon={Mail} label="Email Address" value={email} />
                    <InfoRow icon={MapPin} label="Home Address" value={address} />
                  </CardContent>
                </Card>

                {/* Important Dates Card */}
                <Card className="border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl">
                  <div className="p-4 bg-muted/20 border-b border-border/20">
                    <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                       <Calendar className="h-3 w-3" /> Important Dates
                    </h3>
                  </div>
                  <CardContent className="p-4 space-y-1 divide-y divide-border/10">
                    <InfoRow 
                      icon={Cake} 
                      label="Date of Birth" 
                      value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} 
                      subValue={dateOfBirth ? `${new Date().getFullYear() - new Date(dateOfBirth).getFullYear()} Years Old` : undefined}
                    />
                    <InfoRow 
                      icon={Heart} 
                      label="Marriage Anniversary" 
                      value={anniversaryDate ? new Date(anniversaryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} 
                    />
                  </CardContent>
                </Card>

                {/* Lineage Card */}
                <Card className="md:col-span-2 border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl">
                  <div className="p-4 bg-muted/20 border-b border-border/20">
                    <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                       <Users className="h-3 w-3" /> Parents & Lineage
                    </h3>
                  </div>
                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 divide-y md:divide-y-0 divide-border/10">
                    <InfoRow icon={User2} label="Father's Name" value={fatherName} />
                    <div className="md:border-l md:border-border/10 md:pl-8">
                       <InfoRow icon={User2} label="Mother's Name" value={motherName} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="family" className="mt-6 animate-in slide-in-from-bottom-4 duration-500 pb-4">
               <div className="w-full">
                {memberId ? (
                  <HouseholdPanel memberId={memberId} />
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-muted/20">
                     <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Home className="h-8 w-8 text-muted-foreground/30" />
                     </div>
                     <div className="space-y-1">
                        <p className="font-bold text-muted-foreground">No Family Data</p>
                        <p className="text-xs text-muted-foreground/60 max-w-[200px]">This member hasn't been assigned to a family yet.</p>
                     </div>
                  </div>
                )}
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex items-center justify-center pt-8 gap-4 border-t border-border/10 mt-8 pb-4">
          {isPending ? (
            <Button disabled variant="outline" className="rounded-xl px-8 h-12">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Initializing...
            </Button>
          ) : data?.data?.data?.signature ? (
            <Button 
              className="rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" 
              onClick={() => window.print()}
            >
              <Printer className="h-5 w-5" /> Print Membership Certificate
            </Button>
          ) : (
            <Modal 
              triggerButtonContent={<><Printer className="h-5 w-5 mr-2" /> Generate Certificate</>} 
              modelTitle="Certificate Generation" 
              modelDescription="A pastor's signature is required to generate this official document." 
              triggerButtonVariant="default"
              triggerClassName="rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20"
            >
              <SignatureCard postSignatureMutation={signatureMutation} />
            </Modal>
          )}
        </div>
      </div>

      {/* ── PRINT VIEW (unchanged from before) ── */}
      <div className="hidden print:block max-w-3xl mx-auto p-8 bg-white">
        <style>{`
          @media print {
            @page { size: A4; margin: 1cm; }
            body, html { margin: 0 !important; padding: 0 !important; font-family: 'Times New Roman', Times, serif; }
            .signature-img { max-height: 50px; max-width: 200px; object-fit: contain; display: block; margin: 0 auto; }
            .no-signature { text-align: center; color: #666; font-style: italic; }
          }
        `}</style>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wider">{churchName}</h1>
          <p className="text-lg text-gray-600 italic mt-2">Welcoming You to Our Family in Faith</p>
        </div>
        <div className="p-0">
          <h2 className="text-2xl font-semibold text-center mb-8">Church Membership Form</h2>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{firstName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{lastName || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{fatherName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{motherName || "N/A"}</p>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{address || "N/A"}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{dateOfBirth || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{phone || "N/A"}</p>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Spiritual Status</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{spiritualStatus || "N/A"}</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-gray-400 mt-4 mb-3 h-16" />
              <p className="text-center text-sm font-medium">Member's Signature</p>
              <p className="text-center text-sm mt-3">Date: ____________________</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mt-4 mb-3 h-16 flex items-center justify-center">
                {data?.data?.data?.signature?.signaturePicName ? (
                  <img
                    src={data.data.data.signature.signaturePicPath?.startsWith('http')
                      ? data.data.data.signature.signaturePicPath
                      : `${import.meta.env.VITE_APP_API_URL}/signatures/${data.data.data.signature.signaturePicName}`}
                    alt="Pastor's Signature"
                    className="signature-img"
                  />
                ) : (
                  <p className="no-signature">No signature available</p>
                )}
              </div>
              <p className="text-center text-sm font-medium">Pastor's Signature</p>
              <p className="text-center text-sm mt-3">Date: ____________________</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}