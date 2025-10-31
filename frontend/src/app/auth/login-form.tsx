import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import api from "@/api/api";
import { twofaMemoryChecker } from "@/services/authService";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserProvider";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const location = useLocation();
  const userContext = useUser();
  // const [churchname, setChurchname] = useState("");
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  let navigate = useNavigate();
  console.log("hello");

  type FormFields = {
    churchname: string;
    username: string;
    password: string;
    formSubmitError: string;
  };
  const {
    watch,
    handleSubmit,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      churchname: "",
      username: "",
      password: "",
      formSubmitError: "",
    },
  });

  interface loginResponse {
    access_token: string;
    refresh_token: string;
    updated_db_document: updatedDbDocument;
  }

  interface updatedDbDocument {
    _id: string;
    churchName: string;
    userName: string;
    password: string;
    roles: string[];
    __v: string;
    refresh_token: string;
  }

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return api.post(`/auth/login`, data)
    },
    onSuccess: async (response) => {
      console.log(response.data.data);
      userContext.setChurch(response.data.data.UserInfo.church);
      userContext.setUser(response.data.data.UserInfo.user);
      console.log("Post successful:", response.data);
      // After successfull login, check if user needs to go through 2fa in this device
      const twofaMemoryCheckResult = await twofaMemoryChecker();
      const doesDeviceExist = twofaMemoryCheckResult.data.data.doesDeviceExist;
      console.log("DoesDeviceExist:", twofaMemoryCheckResult);
      if (doesDeviceExist) {
        userContext.login();
        navigate("/dashboard");
      }
      else navigate("/otpMethod");
      // setValue("userName", "");
      // setValue("password", "");
      return queryClient.invalidateQueries({
        queryKey: ["membersData"],
      });
    },
    onError: (error: any) => {
      console.log(error)
      if (error.response?.data) {
        setError("formSubmitError", {
          type: "manual",
          message: `${error.response.data.message}`,
        });
      } else {
        setError("formSubmitError", {
          type: "manual",
          message: `Back-end has not been initialized yet`,
        });
      }
      console.error("Error posting data:", error.response.data);
    }
  });


  const { churchname, username, password } = watch();
  const handleLoginFormSubmission = async (
    data: FormFields
  ): Promise<loginResponse> => {
    const apiURL = import.meta.env.VITE_APP_API_URL;
    const payload = {
      userName: username,
      churchName: churchname,
      password: password,
    };
    mutation.mutate(payload)
    return {} as loginResponse;
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Faith Connect
        </a>
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleLoginFormSubmission)}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="churchName">Church Name</Label>
                      <Input
                        id="churchName"
                        type="text"
                        value={churchname}
                        placeholder="Bethel Church"
                        {...register("churchname", {
                          required: "Church name cannot be empty.",
                          minLength: {
                            value: 2,
                            message: "Minimum length is 2",
                          },
                          maxLength: {
                            value: 40,
                            message: "Maximum length is 40",
                          },
                        })}
                      />
                      {errors.churchname && (
                        <div className="text-red-500 text-sm">
                          {errors.churchname.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="userName">User Name</Label>
                      <Input
                        id="userName"
                        type="text"
                        value={username}
                        placeholder="PastorJeff"
                        {...register("username", {
                          required: "User name cannot be empty.",
                          minLength: {
                            value: 2,
                            message: "Minimum length is 2",
                          },
                          maxLength: {
                            value: 20,
                            message: "Maximum length is 20",
                          },
                        })}
                      />
                      {errors.username && (
                        <div className="text-red-500 text-sm">
                          {errors.username.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        value={password}
                        type="password"
                        {...register("password", {
                          required: "Password cannot be empty",
                        })}
                      />
                      {errors.password && (
                        <div className="text-red-500 text-sm">
                          {errors.password.message}
                        </div>
                      )}
                    </div>

                    <Button type="submit" onClick={() => clearErrors("formSubmitError")} className="w-full">
                      Login <>
                        {mutation.isPending && (
                          <Spinner></Spinner>
                        )}
                      </>
                    </Button>
                    {errors.formSubmitError && (
                      <div className="text-destructive">
                        {errors.formSubmitError.message}
                      </div>
                    )}
                    {location.state?.error && (
                      <div className="text-destructive">
                        {location.state?.error}
                      </div>
                    )}
                  </div>
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="underline underline-offset-4">
                      Sign up
                    </a>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div >
  );
}
