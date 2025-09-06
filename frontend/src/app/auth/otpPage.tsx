"use client";

import * as React from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtpRequest } from "@/services/authService";
import { useNavigate } from "react-router";

export function InputOTPControlled() {
  const navigate = useNavigate();

  const [value, setValue] = React.useState("");
  // console.log(isAwaitingOTP());

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* <div className="flex w-full max-w-sm flex-col gap-6"></div> */}
      <div className="space-y-2">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => {
            setValue(value);
            verifyOtpRequest(value);
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-center text-sm">
          {value === "" ? (
            <>
              Enter your one-time password. <br /> Please check your phone{" "}
            </>
          ) : (
            <>You entered: {value}</>
          )}
        </div>
      </div>
    </div>
  );
}
