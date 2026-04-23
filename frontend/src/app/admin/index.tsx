import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserProvider";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import { useCrop } from "@/context/CropProvider";
import api from "@/api/api";
import { toast } from "sonner";
import { Building2, Mail, Phone, Upload } from "lucide-react";

type ChurchSettingsFormData = {
  churchName: string;
  email: string;
  phone: string;
  logo?: any;
};

export const SettingsPage = () => {
  const { church, setChurch } = useUser();
  const { setCroppedImage } = useCrop();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, reset } = useForm<ChurchSettingsFormData>({
    defaultValues: {
      churchName: church?.churchName || "",
      email: church?.email || "",
      phone: church?.phone || "",
    }
  });

  const { AvatarUploadCropperContent } = useAvatarUploadHandler(setValue, control);

  useEffect(() => {
    if (church?.logo) {
      console.log(church.logo)
      const logoUrl = church.logo.startsWith('http')
        ? church.logo
        : `/uploads/${church.logo}`;
      setCroppedImage(logoUrl);
    }
  }, [church, setCroppedImage]);

  // Add
  useEffect(() => {
  if (church) {
    reset({
      churchName: church.churchName,
      email: church.email,
      phone: church.phone,
      logo: church.logo
    });
    console.log(church)
  }
}, [church, reset]);

  const onSubmit = async (data: ChurchSettingsFormData) => {
    setIsSubmitting(true);
    console.log(getValues('logo'))
    try {
      const formData = new FormData();
      formData.append("churchName", data.churchName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      if (data.logo) {
        formData.append("logo", data.logo);
      }

      const response = await api.patch("/churches/my-church", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setChurch(response.data.data);  
      toast.success("Church settings updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update church settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Church Settings</h1>
        <p className="text-muted-foreground">Manage your church profile and branding.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Church Information</CardTitle>
                <CardDescription>
                  This information will be used across the platform and in communications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="churchName">Church Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="churchName"
                        className="pl-10"
                        {...register("churchName", { required: "Church name is required" })}
                      />
                    </div>
                    {errors.churchName && <p className="text-xs text-red-500">{errors.churchName.message}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Public Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          {...register("email", { required: "Email is required" })}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          {...register("phone", { required: "Phone is required" })}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Upload your church logo. This will be displayed in the sidebar and on reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6 py-10">
                <AvatarUploadCropperContent fieldName="logo" />
                <div className="w-full max-w-xs">
                  <AvatarUploadButton
                    setValue={setValue}
                    getValues={getValues}
                    control={control}
                    name="logo"
                    label="Church Logo"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Recommended size: 512x512px. JPG or PNG.
                </p>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Branding"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
};