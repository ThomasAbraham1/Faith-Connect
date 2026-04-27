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
  Phone, Mail, MapPin, Calendar, User2, Heart, Users, Home, Cake, Star, Printer
} from "lucide-react"

const SPIRITUAL_STATUS_COLOR: Record<string, string> = {
  BELIEVER: 'bg-green-500/10 text-green-700 border-green-200',
  NON_BELIEVER: 'bg-slate-500/10 text-slate-600 border-slate-200',
  SEEKER: 'bg-blue-500/10 text-blue-600 border-blue-200',
  UNDECIDED: 'bg-amber-500/10 text-amber-600 border-amber-200',
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
};

export const ViewProfile = ({ memberId, userName, profilePicUrl, phone, churchName, spiritualStatus, dateOfBirth, address, fatherName, motherName, lastName, firstName, email, anniversaryDate }: any) => {
  const [open, setOpen] = React.useState(false);
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
      {/* ── PREMIUM PROFILE CARD ── */}
      <div className="space-y-5 print:hidden">

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-border/50">
          {/* Decorative background rings */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-primary/5 blur-xl" />

          <div className="relative p-6 flex items-start gap-5">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg flex-shrink-0">
              <AvatarImage
                src={profilePicUrl?.startsWith('http') ? profilePicUrl : `${import.meta.env.VITE_APP_API_URL}${profilePicUrl}`}
                alt={fullName}
              />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-xl font-bold tracking-tight truncate">{fullName}</h2>
              <p className="text-sm text-muted-foreground">@{userName}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {spiritualStatus && (
                  <Badge variant="outline" className={`text-xs ${statusColor}`}>
                    <Star className="h-3 w-3 mr-1" />
                    {spiritualStatus.charAt(0) + spiritualStatus.slice(1).toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="gap-2 text-xs">
              <User2 className="h-3.5 w-3.5" /> Personal Info
            </TabsTrigger>
            <TabsTrigger value="family" className="gap-2 text-xs">
              <Home className="h-3.5 w-3.5" /> Family
            </TabsTrigger>
          </TabsList>

          {/* PERSONAL INFO TAB */}
          <TabsContent value="personal" className="mt-4 space-y-3">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-2 divide-y divide-border/50">
                <InfoRow icon={Phone} label="Phone Number" value={phone} />
                <InfoRow icon={Mail} label="Email Address" value={email} />
                <InfoRow icon={MapPin} label="Address" value={address} />
                <InfoRow icon={Cake} label="Date of Birth" value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : dateOfBirth} />
                <InfoRow icon={Heart} label="Anniversary" value={anniversaryDate ? new Date(anniversaryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : anniversaryDate} />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-2 divide-y divide-border/50">
                <InfoRow icon={Users} label="Father's Name" value={fatherName} />
                <InfoRow icon={Users} label="Mother's Name" value={motherName} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAMILY TAB */}
          <TabsContent value="family" className="mt-4">
            {memberId ? (
              <HouseholdPanel memberId={memberId} />
            ) : (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6 pb-6 flex flex-col items-center gap-2 text-center">
                  <Home className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No family information available.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Print Button */}
        <div className="flex justify-center gap-3">
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50 rounded-2xl">
              <LoadingSpinner />
            </div>
          )}
          {data?.data?.data?.signature ? (
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print Membership Card
            </Button>
          ) : error ? (
            <Button variant="outline" className="gap-2" onClick={() => toast.error((error as any)?.response?.data?.message || 'No pastor signature found.')}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          ) : (
            <Modal triggerButtonContent={<><Printer className="h-4 w-4 mr-2" /> Print</>} modelTitle="Signature Required" modelDescription="Please set the pastor's signature before printing." onOpenChange={() => {}}>
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