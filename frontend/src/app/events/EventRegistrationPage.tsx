import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Calendar, MapPin, User2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_APP_API_URL;

export const EventRegistrationPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-event', eventId],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/events/public/${eventId}`);
      return res.data?.data || res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      axios.post(`${API_BASE}/events/public/${eventId}/register`, form),
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">You're registered!</h1>
          <p className="text-muted-foreground">
            Thanks, <strong>{form.firstName}</strong>! You're all set for <strong>{event.eventName}</strong>.
            We'll be in touch.
          </p>
          <div className="mt-2 p-4 rounded-xl border border-border/50 bg-muted/30 text-left w-full space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
            </div>
            {event.eventLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {event.eventLocation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image Header */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.eventName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">{event.churchName}</p>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">{event.eventName}</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            {event.eventDate && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {event.eventLocation && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.eventLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
        {event.description && (
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{event.description}</p>
        )}

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-primary" />
              Register for this event
            </CardTitle>
            <CardDescription>Fill in your details below to secure your spot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Thomas" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Abraham" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={() => mutation.mutate()}
              disabled={!form.firstName || !form.lastName || !form.email || !form.phone || mutation.isPending}
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...</>
              ) : (
                'Register Now'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
