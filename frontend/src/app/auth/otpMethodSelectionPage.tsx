"use client";

import { useLoaderData, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { CardTitle } from "../../components/ui/card";
import { selectOTPMethod } from "@/services/authService";
import { useEffect } from "react";

export function OTPMethodSelection() {
  // const twoFaMemoryCheckerResponse = useLoaderData();
  // const doesDeviceExist = twoFaMemoryCheckerResponse.data.doesDeviceExist;
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (doesDeviceExist) navigate('/dashboard');
  // }, []);
  const handleMethodSelect = async (method: "sms" | "email") => {
    const response = await selectOTPMethod(method); // Calls backend to send OTP
    if (response) navigate("/otp");
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <CardTitle className="text-xl">Select OTP Delivery Method</CardTitle>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button onClick={() => handleMethodSelect("sms")}>
          Send OTP via SMS
        </Button>
        <Button onClick={() => handleMethodSelect("email")}>
          Send OTP via Email
        </Button>
      </div>
    </div>
  );
}
