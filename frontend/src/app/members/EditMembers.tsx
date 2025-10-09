import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from "@/api/api";
import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import { DynamicSheet } from "@/components/dynamic/DynamicSheet";
import LoadingSpinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCrop } from "@/context/CropProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type MouseEventHandler } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { PhoneInput } from "@/components/phone-input";
import { DatePicker } from "@/components/date-picker";
import { useUser } from "@/context/UserProvider";
import { Textarea } from "@/components/ui/textarea";



type roleRecordType = {
  _id: string;
  name: string;
  Permissions: string[]
}
type formDataType = {
  userName: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  spiritualStatus: 'BELIEVER' | 'NON_BELIEVER' | 'SEEKER' | 'UNDECIDED';
  profilePic?: FileList | null | Blob;
  role: string
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  address: string;
};

// Children is edit icon, username and password are extracted from table and passed as default values
export const EditMembers = (props: {
  children: React.ReactNode;
  userName: string;
  password: string;
  spiritualStatus: formDataType["spiritualStatus"];
  phone: string;
  dateOfBirth: string;
  id: string;
  profilePicUrl: string;
  roles: string;
  fatherName: string;
  address: string;
  lastName: string;
  motherName: string;
  firstName: string;
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
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<formDataType>({
    defaultValues: {
      profilePic: undefined,
      userName: props.userName,
      password: props.password,
      phone: props.phone,
      dateOfBirth: props.dateOfBirth,
      spiritualStatus: props.spiritualStatus,
      role: props.roles,
      fatherName: props.fatherName,
      motherName: props.motherName,
      firstName: props.firstName,
      lastName: props.lastName,
      address: props.address,
    },
  });
  var profilePic = useWatch({ control, name: "profilePic" });

  const { AvatarUploadCropperContent, DynamicCropper, handleReset, setCroppedImageFunction, afterSubmitHandleReset } = useAvatarUploadHandler(setValue, control)
  const { croppedImage, setCroppedImage, selectedFile, setSelectedFile } = useCrop();
  const userContext = useUser()
  const submitHandlerFunction = async (data: formDataType) => {
    afterSubmitHandleReset()

    // Converting react hook form data into form data which is of Multipart type
    const formdata = new FormData();
    formdata.append("userName", data.userName.trim());
    formdata.append("password", data.password.trim());
    formdata.append("spiritualStatus", data.spiritualStatus.trim());
    formdata.append("dateOfBirth", data.dateOfBirth.trim());
    formdata.append("phone", data.phone.trim());
    formdata.append("address", data.address.trim());
    formdata.append("motherName", data.motherName.trim());
    formdata.append("fatherName", data.fatherName.trim());
    formdata.append("lastName", data.lastName.trim());
    formdata.append("firstName", data.firstName.trim());
    formdata.append("roles", data.role);
    // Convert base64 string to blob
    if (croppedImage) {
      const base64 = await fetch(croppedImage);
      const blobImage = await base64.blob();
      // console.log(blobImage)
      formdata.append("profilePic", blobImage);
    }
    const member = mutation.mutate(formdata);
  };
  const queryClient = useQueryClient();
  console.log(props.roles)
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      return api.patch(`/members/${props.id}`, data);
    },
    onSuccess: (data) => {
      console.log(data);
      setValue("userName", "");
      setValue("password", "");
      return queryClient.invalidateQueries({
        queryKey: ["membersData"],
      });
    },
  });

  // InputFields
  // Sheet on change function
  const sheetOnOpenChange = (open: boolean) => {
    console.log(open)
    if (!open) {
      console.log("hello")
      reset();
      afterSubmitHandleReset();
    } else {
      profilePicmutation.mutate(props.profilePicUrl)
      // alert(props.profilePicUrl)
    }
  }

  const profilePicmutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await api.get(data, {
        responseType: 'blob'
      })
      setCroppedImage(URL.createObjectURL(response.data))
      return response
    },
  });



  return (
    <DynamicSheet
      sheetOnOpenChange={sheetOnOpenChange}
      sheetConfig={{
        // Passing to trigger button the Edit Icon from table
        triggerButtonText: props.children,
        triggerButtonVariant: props.triggerButtonVariant,
      }}
      gridConfig={{ size: 550, col: 1 }}
    >
      <>
        {mutation.isPending && profilePicmutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <LoadingSpinner />
          </div>
        )}
        <form
          onSubmit={handleSubmit(submitHandlerFunction)}
          className="contents" // makes form not add extra box
        >
          <SheetHeader>
            <SheetTitle>Edit member details</SheetTitle>
            <SheetDescription>
              Edit member details and click on save
            </SheetDescription>
          </SheetHeader>
          <div
            className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4`}
          >
            <AvatarUploadCropperContent></AvatarUploadCropperContent>
            <AvatarUploadButton setValue={setValue} control={control} ></AvatarUploadButton>
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
                <Label htmlFor="userName"> Username: </Label>
                <Input id="userName"  {...register("userName", {
                  required: 'Username is required'
                })} />
                {errors.userName && (
                  <div className="text-red-500 text-sm">
                    {errors.userName.message}
                  </div>
                )}</div>
              <div className="grid gap-3">

                <Label htmlFor="password"> Password: </Label>
                <Input id="password" {...register("password", {
                  required: 'Password is required'
                })} />
                {errors.password && (
                  <div className="text-red-500 text-sm">
                    {errors.password.message}
                  </div>
                )}</div>
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

                <Label htmlFor="phone">Phone:</Label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone is required" }}
                  render={({ field }) => (
                    <PhoneInput value={field.value} placeholder="Enter a phone number" onChange={(value) => field.onChange(value)}></PhoneInput>
                  )}
                />
                {errors.phone && (
                  <div className="text-red-500 text-sm">
                    {errors.phone.message}
                  </div>
                )}
              </div>

              <div className="grid gap-3">

                <Label htmlFor="dateOfBirth">Date of birth:</Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: "Date of birth is required" }}
                  render={({ field }) => (
                    <DatePicker value={field.value as any as Date} className='w-full' onChange={(value) => field.onChange(value)}></DatePicker>
                  )}
                />
                {errors.dateOfBirth && (
                  <div className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </div>
                )}</div>
              <div className="grid gap-3">

                <Label htmlFor="spiritualStatus">Spiritual Status:</Label>
                <Controller
                  name="spiritualStatus"
                  control={control}
                  rules={{ required: "Spiritual status is required" }}
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
                )}</div>
              <div className="grid gap-3">

                <Label htmlFor="role">Roles:</Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Roles are required" }}
                  render={({ field }) => (
                    <Select value={field?.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className=" w-full">
                        <SelectValue placeholder="Choose roles" />
                      </SelectTrigger>
                      <SelectContent className='w-full'>
                        {userContext.church &&
                          userContext.church.roles.map((roleRecord) =>
                            <SelectItem value={roleRecord.name}>{roleRecord.name}</SelectItem>
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
      </>
    </DynamicSheet>
  );
};
