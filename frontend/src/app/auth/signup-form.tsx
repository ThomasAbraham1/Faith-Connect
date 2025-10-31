import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { PhoneInput } from "@/components/phone-input";
import { useUser } from "@/context/UserProvider";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // const [churchname, setChurchname] = useState("");
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  // const [email, setEmail] = useState("");
  // const [phone, setPhone] = useState<Value | undefined>();
  let navigate = useNavigate();

  type FormFields = {
    userName: string;
    churchName: string;
    password: string;
    phone: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  const {
    register,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitted, isValid, errors },
  } = useForm<FormFields>({
    defaultValues: {
      churchName: "",
      userName: "",
      email: "",
      password: "",
      phone: "",
    },
  });
  const userContext = useUser()
  const { churchName, userName, email, password, phone, firstName, lastName } = watch();
  const location = useLocation();
  useEffect(() => {
    userContext?.login()
  }, [])
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return api.post(`/auth/signup`, data);
    },
    onSuccess: (data) => {
      console.log("Signup successful:", data);
      navigate("/otpMethod");
      console.log(data);
    },
    onError: (error: any) => { throw error.response.data }
  });
  const handleSignupFormSubmission = async (data: FormFields) => {
    const phone = data.phone;
    console.log(data);
    mutation.mutate(data)
  };
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Faith Connect
        </a>
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Welcome to Faith Connect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleSignupFormSubmission)}>
                <div className="grid gap-6 ">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-3">
                      <Label htmlFor="churchName">Church Name</Label>
                      <Input
                        id="churchName"
                        type="text"
                        value={churchName}
                        placeholder="Bethel Church"
                        {...register("churchName", {
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
                      {errors.churchName && (
                        <div className="text-red-500 text-sm">
                          {errors.churchName.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        placeholder="Arelius"
                        {...register("firstName", {
                          required: "First Name cannot be empty",
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
                      {errors.firstName && (
                        <div className="text-red-500 text-sm">
                          {errors.firstName.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        placeholder="Augustine"
                        {...register("lastName", {
                          required: "Last Name cannot be empty",
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
                      {errors.lastName && (
                        <div className="text-red-500 text-sm">
                          {errors.lastName.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="userName">User Name</Label>
                      <Input
                        id="userName"
                        type="text"
                        value={userName}
                        placeholder="PastorJeff"
                        {...register("userName", {
                          required: "User name cannot be empty",
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
                      {errors.userName && (
                        <div className="text-red-500 text-sm">
                          {errors.userName.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="text"
                        value={email}
                        placeholder="pastor@bethel.com"
                        {...register("email", {
                          required: "Email cannot be empty",
                          minLength: {
                            value: 2,
                            message: "Minimum length is 2",
                          },
                          maxLength: {
                            value: 40,
                            message: "Maximum length is 40",
                          },
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <div className="text-red-500 text-sm">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3 w-full">
                      <Label htmlFor="phone">Phone</Label>
                      <Controller
                        name="phone"
                        control={control}
                        rules={{ required: "Phone is required" }}
                        render={({ field }) => (
                          <PhoneInput {...field} placeholder="Enter a phone number" onChange={(value) => field.onChange(value)}></PhoneInput>
                        )}
                      />
                      {errors.phone && (
                        <div className="text-red-500 text-sm">
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        value={password}
                        type="password"
                        {...register("password", {
                          required: "Password cannot be empty",
                          minLength: {
                            value: 8,
                            message:
                              "Password must be at least 8 characters long",
                          },
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message:
                              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                          },
                        })}
                      />
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                      {errors.password && (
                        <div className="text-red-500 text-sm">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    // disabled={!isValid}
                    type="submit"
                    className="w-full"
                  >
                    Signup
                    <>
                      {mutation.isPending && (
                        <Spinner></Spinner>
                      )}
                    </>
                  </Button>
                  {location.state?.error && (
                    <div className="text-destructive">
                      {location.state?.error}
                    </div>
                  )}
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/" className="underline underline-offset-4">
                      Login
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
    </div>
  );
}
// BB31FPZQ8XKUEYC8QSYDT9N5
// For validation Using ZOD

// import { z } from "zod";
// import { isPossiblePhoneNumber } from "react-phone-number-input";

// const signupSchema = z.object({
//   username: z.string().min(1, "Username is required"),
//   churchname: z.string().min(1, "Church name is required"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   email: z.string().email("Invalid email address"),
//   phone: z
//     .string()
//     .refine((val) => isPossiblePhoneNumber(val), {
//       message: "Invalid phone number",
//     }),
// });

// // Example usage:
// const result = signupSchema.safeParse({
//   username: "John",
//   churchname: "Grace Church",
//   password: "123456",
//   email: "test@example.com",
//   phone: "+12223333333",
// });
