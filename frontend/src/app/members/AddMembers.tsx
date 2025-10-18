import api from "@/api/api";
import { DynamicSheet } from "@/components/dynamic/DynamicSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, FormProvider } from "react-hook-form";

import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import LoadingSpinner from "@/components/spinner";
import { useCrop } from "@/context/CropProvider";
import { PhoneInput } from "@/components/phone-input";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { is } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { SignatureCard } from "@/components/dynamic/DynamicSignatureCard";
import { Modal } from "@/components/dynamic/Modal";


type formDataType = {
  firstName: string;
  userName: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  spiritualStatus: 'BELIEVER' | 'NON_BELIEVER' | 'SEEKER' | 'UNDECIDED';
  profilePic?: FileList | null | Blob;
  role: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  address: string;
  signature: Blob;
};

type roleRecordType = {
  _id: string;
  name: string;
  Permissions: string[]
}


export const AddMembers = (props: {
  triggerButtonVariant:
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;
}) => {

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<formDataType>({
    defaultValues: {
      profilePic: undefined,
      userName: "",
      password: "",
    },
  });


  const [modalOpen, setModalOpen] = useState(false)

  const { AvatarUploadCropperContent, DynamicCropper, handleReset, setCroppedImageFunction, afterSubmitHandleReset } = useAvatarUploadHandler(setValue, control)
  const { croppedImage, setCroppedImage } = useCrop();
  const MemoizedAvatarUploadCropperContent = useMemo(
    () => <AvatarUploadCropperContent />,
    []
  );
  // console.log(profilePic);

  const submitHandlerFunction = async (data: formDataType) => {
    // avatarHandler.handleReset();
    // afterSubmitHandleReset()


    // Converting react hook form data into form data which is of Multipart type
    const formdata = new FormData();
    formdata.append("userName", data.userName?.trim());
    formdata.append("password", data.password?.trim());
    formdata.append("spiritualStatus", data.spiritualStatus?.trim());
    formdata.append("dateOfBirth", data.dateOfBirth?.trim());
    formdata.append("phone", data.phone?.trim());
    formdata.append("address", data.address?.trim());
    formdata.append("motherName", data.motherName?.trim());
    formdata.append("fatherName", data.fatherName.trim());
    formdata.append("lastName", data.lastName?.trim());
    formdata.append("firstName", data.firstName?.trim());
    formdata.append("roles", data.role?.trim());
    if(data.role == 'pastor'){
      console.log('Inside if pastor block')
      formdata.append("signature", data.signature);
    }
    // Convert base64 string to blob
    if (croppedImage) {
      const base64 = await fetch(croppedImage);
      const blobImage = await base64.blob();
      console.log(blobImage);
      formdata.append("profilePic", blobImage);
    }
    // console.log(formdata);
    mutation.mutate(formdata);
  };

  // queryClient for mutating the table data query
  const queryClient = useQueryClient();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Add members mutation
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      return api.post("/members", data);
    },
    onSuccess: (data) => {
      console.log(data);
      reset()
      afterSubmitHandleReset()
      return queryClient.invalidateQueries({
        queryKey: ["membersData"],
      });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message)
  });

  // Retrieving user roles
  const { data: rolesData, isPending: isRolesQueryPending, isFetching, error } = useQuery({
    queryKey: ["rolesData"],
    queryFn: async () => {
      try {
        const response = await api.get("/churches/roles");
        return response.data;  // ✅ return the actual data
      } catch (err: any) {
        console.log(err.response.data.message)
        toast.error(err?.response?.data?.message || "Error fetching roles")
      }
    },
  });

  const sheetOnOpenChange = (open: boolean) => {
    console.log(open)
    if (!open) {
      console.log("hello")
      reset();
      afterSubmitHandleReset();
    }
  }
  if (!isRolesQueryPending) {
    console.log(rolesData.data[0].name)
  }

  console.log("MONEy")
  return (
    <DynamicSheet
      sheetOnOpenChange={sheetOnOpenChange}
      sheetConfig={{
        triggerButtonText: "Add Member",
        triggerButtonVariant: props.triggerButtonVariant,
      }}
      gridConfig={{ size: 140, col: 1 }}
    >
      <form
        onSubmit={handleSubmit(submitHandlerFunction)}
        className="contents" // makes form not add extra box
      >
        {(mutation.isPending || isRolesQueryPending) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <LoadingSpinner />
          </div>
        )}
        <SheetHeader>
          <SheetTitle>Enter member details</SheetTitle>
          <SheetDescription>
            Add member details and click on save
          </SheetDescription>
        </SheetHeader>
        <div
          className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4 `}
        >
          {MemoizedAvatarUploadCropperContent}
          <AvatarUploadButton isRequired={true} setValue={setValue} control={control} >
            {errors.profilePic && (
              <div className="text-red-500 text-sm">
                {errors.profilePic.message}
              </div>
            )}
          </AvatarUploadButton>
          <div className="grid gap-6  sm:grid-cols-2 grid-rows-auto items-end">
            <div className="grid gap-3">
              <Label htmlFor="firstName">First Name: </Label>
              <Input id="firstName"  {...register("firstName", {
                // required: 'First Name is required'
              })} />{errors.firstName && (
                <div className="text-red-500 text-sm">
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="lastName">Last name: </Label>
              <Input id="lastName"  {...register("lastName", {
                // required: 'Last name is required'
              })} />{errors.lastName && (
                <div className="text-red-500 text-sm">
                  {errors.lastName.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="fatherName">Father Name: </Label>
              <Input id="fatherName"  {...register("fatherName", {
                // required: 'Father Name is required'
              })} />{errors.fatherName && (
                <div className="text-red-500 text-sm">
                  {errors.fatherName.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="motherName">Mother Name: </Label>
              <Input id="motherName"  {...register("motherName", {
                // required: 'Mother Name is required'
              })} />{errors.motherName && (
                <div className="text-red-500 text-sm">
                  {errors.motherName.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="userName">Username: </Label>
              <Input id="userName"  {...register("userName", {
                // required: 'Username is required'
              })} />
              {errors.userName && (
                <div className="text-red-500 text-sm">
                  {errors.userName.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password: </Label>
              <Input id="password"  {...register("password", {
                // required: 'Password is required'
              })} />{errors.password && (
                <div className="text-red-500 text-sm">
                  {errors.password.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone:</Label>
              <Controller
                name="phone"
                control={control}
                // rules={{ required: "Phone is required" }}
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
              <Label htmlFor="address">Address: </Label>
              <Textarea id="address"  {...register("address", {
                required: 'address is required'
              })} />{errors.address && (
                <div className="text-red-500 text-sm">
                  {errors.address.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dateOfBirth">Date of birth:</Label>
              <Controller
                name="dateOfBirth"
                control={control}
                // rules={{ required: "Date of birth is required" }}
                render={({ field }) => (
                  <DatePicker value={field.value as any as Date} className='w-full' onChange={(value) => {
                    field.onChange(value)
                  }}></DatePicker>
                )}
              />
              {errors.dateOfBirth && (
                <div className="text-red-500 text-sm">
                  {errors.dateOfBirth.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">

              <Label htmlFor="spiritualStatus">Spiritual Status:</Label>
              <Controller
                name="spiritualStatus"
                control={control}
                // rules={{ required: "Spiritual status is required" }}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className=" w-full">
                      <SelectValue placeholder="Choose spiritual status" />
                    </SelectTrigger>
                    <SelectContent className='w-full'>
                      <SelectItem value="BELIEVER">BELIEVER</SelectItem>
                      <SelectItem value="UNDECIDED">UNDECIDED</SelectItem>
                      <SelectItem value="SEEKER">SEEKER</SelectItem>
                      <SelectItem value="NON_BELIEVER">NON_BELIEVER</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.spiritualStatus && (
                <div className="text-red-500 text-sm">
                  {errors.spiritualStatus.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="role">Roles:</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Roles are required" }}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className=" w-full">
                      <SelectValue placeholder="Choose roles" />
                    </SelectTrigger>
                    <SelectContent className='w-full'>
                      {!isRolesQueryPending &&
                        rolesData.data.map((roleRecord: roleRecordType) =>
                          <SelectItem key={roleRecord._id} value={roleRecord.name}>{roleRecord.name}</SelectItem>
                        )
                      }
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <div className="text-red-500 text-sm">
                  {errors.role.message}
                </div>
              )}
            </div>
            {watch('role') == 'pastor' &&
              <div className="grid gap-3">
                <Controller
                  name="signature"
                  control={control}
                  rules={{ required: "Signature is required for a pastor" }}
                  render={({ field }) => (
                    <Modal triggerButtonVariant={'outline'} triggerButtonContent={`${(watch('signature') ? 'Edit Signature' : 'Add Signature')}`} modelTitle={'Create your signature'}>
                      <SignatureCard value={(field.value && URL.createObjectURL(field.value)) ?? undefined} onChange={(value: Blob) => {
                        // console.log(value + " ALSJLDJA");
                        field.onChange(value);
                        toast.success('Signature changed!')
                      }}></SignatureCard>
                    </Modal>
                  )}
                />

                {errors.signature && (
                  <div className="text-red-500 text-sm">
                    {errors.signature.message}
                  </div>
                )}
              </div>
            }
          </div>
        </div>
        <SheetFooter className="sticky bottom-0 bg-background z-10">
          <Button type="submit" className="w-full">
            Submit
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </DynamicSheet >
  );
};
