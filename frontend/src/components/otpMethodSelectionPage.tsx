"use client";

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { CardTitle } from "./ui/card";
import { selectOTPMethod } from "@/services/authService";

export function OTPMethodSelection() {
  const { setAuthStage } = useAuth();
  const navigate = useNavigate();

  const handleMethodSelect = async (method: "sms" | "email") => {
    await selectOTPMethod(method); // Calls backend to send OTP
    setAuthStage("awaitingOTP");
    navigate("/otp");
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
