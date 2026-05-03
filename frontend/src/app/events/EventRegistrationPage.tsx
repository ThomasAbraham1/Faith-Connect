import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, Calendar, MapPin, User2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_APP_API_URL;

export const EventRegistrationPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-event', eventId],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/events/public/${eventId}`);
      return res.data?.data || res.data;
    },
  });
  
  useEffect(() => {
    if (isLoading) {
      document.title = "Loading Event...";
    } else if (isError || !event) {
      document.title = "Event Not Found";
    } else if (!event.registrationOpen) {
      document.title = "Registration Closed";
    } else if (submitted) {
      document.title = `Registered! — ${event.eventName}`;
    } else if (event?.eventName) {
      document.title = `${event.eventName} — Registration`;
    }
  }, [event, isLoading, isError, submitted]);

  const mutation = useMutation({
    mutationFn: () =>
      axios.post(`${API_BASE}/events/public/${eventId}/register`, responses),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed. Please check your details.');
    },
  });

  const handleInputChange = (name: string, value: any) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="text-xl font-semibold">Event not found</p>
        <p className="text-muted-foreground text-sm">This link may be invalid or the event has been removed.</p>
      </div>
    );
  }

  if (!event.registrationOpen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <XCircle className="h-12 w-12 text-amber-500" />
        <p className="text-xl font-semibold">Registration is closed</p>
        <p className="text-muted-foreground text-sm">Registration for this event is no longer available.</p>
      </div>
    );
  }

  const fixedFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'e.g. Thomas' },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: 'e.g. +91 98765 43210' },
    { name: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'e.g. you@example.com' },
  ];

  const allFields = [...fixedFields, ...(event.formFields || [])];

  const isFormIncomplete = allFields.some(field =>
    field.required && (!responses[field.name] || responses[field.name]?.toString().trim() === '')
  );

  const ogImage = event.coverImageUrl || event.churchLogo;
  const pageUrl = window.location.href;

  if (submitted) {
    return (
      <div className="min-h-screen relative flex flex-col lg:flex-row bg-zinc-950">
        <Helmet>
          <meta property="og:title" content={`Registered! — ${event.eventName}`} />
        </Helmet>

        {/* Background Image / Panel */}
        <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 h-[30vh] relative overflow-hidden bg-zinc-900 flex items-center justify-center">
          {event.coverImageUrl ? (
            <>
              <img src={event.coverImageUrl} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 grayscale-[0.5]" alt="" />
              <img src={event.coverImageUrl} className="relative z-10 max-w-full max-h-full object-contain p-8 grayscale-[0.2]" alt="" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-zinc-900" />
          )}
          {/* Church Branding Card (Success State) */}
          <div className="absolute top-10 left-10 z-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-4 px-5 py-3.5 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/20 shadow-2xl">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/10 flex-shrink-0">
                {event.churchLogo ? (
                  <img src={event.churchLogo} className="h-full w-full object-cover rounded-lg" alt="" />
                ) : (
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                    {event.churchName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-none">{event.churchName}</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]" />
        </div>

        <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative z-10 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="max-w-md w-full space-y-8 p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white">You're in!</h1>
              <p className="text-zinc-400 text-lg">
                Thanks, <span className="font-bold text-white">{responses.firstName}</span>! Your registration for <span className="font-bold text-white">{event.eventName}</span> is confirmed.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 text-left space-y-4 text-sm text-zinc-300">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold tracking-tight">
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                </span>
              </div>
              {event.eventLocation && (
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold tracking-tight">{event.eventLocation}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/10 text-white hover:bg-white/5 font-bold tracking-widest uppercase transition-all"
                onClick={() => window.location.reload()}
              >
                Register another person
              </Button>
              <p className="mt-8 text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-600">Faith Connect Registration System</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-primary selection:text-white">
      <Helmet>
        <meta property="og:title" content={event.eventName} />
        <meta property="og:description" content={event.description || `Register for ${event.eventName} at ${event.churchName}`} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={event.eventName} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side: Sticky Image — Dynamic height on mobile, fixed on desktop */}
        <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 h-auto relative overflow-hidden bg-zinc-900 flex items-center justify-center">
          {event.coverImageUrl ? (
            <>
              {/* Blurred ambient background */}
              <img src={event.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 lg:block hidden" />
              {/* Foreground image — Full visibility */}
              <img src={event.coverImageUrl} alt={event.eventName} className="relative z-10 w-full h-auto lg:h-full lg:object-contain block" />
            </>
          ) : (
            <div className="w-full h-[30vh] lg:h-full bg-gradient-to-br from-indigo-900 via-zinc-900 to-black flex items-center justify-center">
              <Calendar className="h-24 w-24 text-white/5" />
            </div>
          )}
        </div>

        {/* Right Side: Scrollable Content & Form */}
        <div className="lg:w-1/2 flex flex-col p-6 md:p-10 lg:p-16 bg-zinc-950 text-zinc-100">
          <div className="max-w-lg mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Church Identity — top of content panel */}
            {(event.churchLogo || event.churchName) && (
              <div className="flex items-center gap-3 pt-2">
                {event.churchLogo && (
                  <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10 bg-white/5">
                    <img src={event.churchLogo} className="h-full w-full object-cover" alt={event.churchName} />
                  </div>
                )}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-500 leading-none mb-1">Hosted by</p>
                  <p className="text-sm font-bold text-zinc-300 tracking-wide leading-none">{event.churchName}</p>
                </div>
              </div>
            )}

            {/* Header / Details */}
            <div className="space-y-5">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
                {event.eventName}
              </h1>

              <div className="flex flex-wrap gap-4">
                {event.eventDate && (
                  <div className="flex items-center gap-3 text-sm font-bold text-zinc-300 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {event.eventLocation && (
                  <div className="flex items-center gap-3 text-sm font-bold text-zinc-300 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <MapPin className="h-4 w-4 text-primary" />
                    {event.eventLocation}
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                  {event.description}
                </p>
              )}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

            {/* Registration Form Card (integrated into dark theme) */}
            <div className="space-y-10">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <User2 className="h-4 w-4" />
                  </div>
                  Secure Your Spot
                </h2>
                <p className="text-zinc-500 text-sm">Please provide your details below to register.</p>
              </div>

              <div className="grid gap-8">
                {allFields.map((field) => (
                  <div key={field.name} className="grid gap-3">
                    <Label htmlFor={field.name} className="text-zinc-300 font-bold text-xs uppercase tracking-widest ml-1">
                      {field.label}
                      {field.required && <span className="text-red-500 font-black ml-1">*</span>}
                    </Label>

                    {field.type === 'select' ? (
                      <Select
                        value={responses[field.name]}
                        onValueChange={(val) => handleInputChange(field.name, val)}
                      >
                        <SelectTrigger id={field.name} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary focus:border-primary transition-all hover:bg-white/10">
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                          {field.options?.map((opt: string) => (
                            <SelectItem key={opt} value={opt} className="cursor-pointer focus:bg-primary/20">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-primary focus:border-primary min-h-[120px] transition-all hover:bg-white/10"
                        placeholder={`Enter details...`}
                        value={responses[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/10 transition-all hover:bg-white/10 cursor-pointer group" onClick={() => handleInputChange(field.name, !responses[field.name])}>
                        <Checkbox
                          id={field.name}
                          checked={!!responses[field.name]}
                          onCheckedChange={(val) => handleInputChange(field.name, val)}
                          className="rounded-md border-white/20 data-[state=checked]:bg-primary h-5 w-5"
                        />
                        <Label htmlFor={field.name} className="text-sm text-zinc-400 font-medium cursor-pointer select-none group-hover:text-zinc-200">
                          I agree to the registration terms
                        </Label>
                      </div>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-14 rounded-2xl focus:ring-primary focus:border-primary transition-all hover:bg-white/10"
                        placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                        value={responses[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button
                  className="w-full h-16 text-lg font-black tracking-widest uppercase rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] bg-primary hover:bg-primary/90"
                  onClick={() => mutation.mutate()}
                  disabled={isFormIncomplete || mutation.isPending}
                >
                  {mutation.isPending ? (
                    <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Processing...</>
                  ) : (
                    'Confirm Registration'
                  )}
                </Button>
                <div className="mt-8 flex justify-center opacity-30 grayscale">
                  <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-400">Powered by Faith Connect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
