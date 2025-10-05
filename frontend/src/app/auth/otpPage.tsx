"use client";

import * as React from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { selectOTPMethod, verifyOtpRequest } from "@/services/authService";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useCountdownTimer } from 'use-countdown-timer';
import { Button } from "@/components/ui/button";

export function InputOTPControlled() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState("");
  const { countdown, start, reset, pause, isRunning } = useCountdownTimer({
    timer: 1000 * 5,
  });
  React.useEffect(() => start(), [])
  const { otpMethod = '' } = useParams<string>()
  const selectOTPMutation = selectOTPMethod(otpMethod)
  const mutation = useMutation({
    mutationFn: (data: string) => api.post(`/auth/verifyOtp`, {
      otpToken: data,
    }),
    onSuccess: (data) => {
      console.log(data.data)
      toast.success('Welcome to Faith Connect')
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.response?.data?.message || 'An error occured')
    }
  })

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* <div className="flex w-full max-w-sm flex-col gap-6"></div> */}
      <div className="space-y-2 flex flex-col items-center">
        {mutation.isPending && (
          <Spinner></Spinner>
        )}
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => {
            setValue(value);
            if (value.length == 6)
              mutation.mutate(value);
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
        <Button variant="link" onClick={() => {
          if (!isRunning && !selectOTPMutation.isPending) {
            selectOTPMutation.mutate(otpMethod)
          }
          if (!isRunning){
            start()
          }
        }}>
          {
            isRunning && !selectOTPMutation.isPending ? <>
              Resend OTP in: {countdown / 1000}
            </> : (<> Resend OTP {selectOTPMutation.isPending && <Spinner />} </>)
          }

        </Button>
      </div>
    </div>
  );
}
