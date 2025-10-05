"use client";

import { useLoaderData, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { CardTitle } from "../../components/ui/card";
import { selectOTPMethod } from "@/services/authService";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toast } from "sonner";

export function OTPMethodSelection() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<null | string>(null)
  const mutation = useMutation({
    mutationFn: (data: string) => api.post(`/auth/otpRequest`, { method: data }),
    onSuccess: (data) => {
      console.log("OTP Sent successfully:", data.data);
      navigate(`/otp/${method}`)
    },
    onError: (error: any) => {console.error("Error posting data:", error.response.data), toast.error(error.response?.data?.message || "Error sending OTP")},
  });

  const handleMethodSelect = async (method: "sms" | "email") => {
    mutation.mutate(method)
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <CardTitle className="text-xl">Select OTP Delivery Method</CardTitle>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button onClick={() => {
          setMethod('sms');
          handleMethodSelect("sms")
        }}>
          Send OTP via SMS
          {mutation.isPending && method == 'sms' && (
            <Spinner></Spinner>
          )}
        </Button>
        <Button onClick={() => {
          setMethod('email');
          handleMethodSelect("email")
        }}>
          Send OTP via Email
          {mutation.isPending && method == 'email' && (
            <Spinner></Spinner>
          )}
        </Button>
      </div>
    </div>
  );
}
