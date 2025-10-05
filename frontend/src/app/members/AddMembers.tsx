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
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import LoadingSpinner from "@/components/spinner";
import { useCrop } from "@/context/CropProvider";
import { PhoneInput } from "@/components/phone-input";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";


type formDataType = {
  userName: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  spiritualStatus: 'BELIEVER' | 'NON_BELIEVER' | 'SEEKER' | 'UNDECIDED';
  profilePic?: FileList | null | Blob;
  role: string;
};


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
    control,
    formState: { errors },
  } = useForm<formDataType>({
    defaultValues: {
      profilePic: undefined,
      userName: "",
      password: "",
    },
  });
  // profilePic is of type FileList
  // var { userName, password } = watch();
  // var profilePic = useWatch({ control, name: "profilePic" });
  // var userName = useWatch({ control, name: "userName" });
  // var password = useWatch({ control, name: "password" });
  // const avatarHandler = new AvatarUploadHandler(setValue, control)
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
    formdata.append("userName", data.userName);
    formdata.append("password", data.password);
    formdata.append("spiritualStatus", data.spiritualStatus);
    formdata.append("dateOfBirth", data.dateOfBirth);
    formdata.append("phone", data.phone);
    // Convert base64 string to blob
    if (croppedImage) {
      const base64 = await fetch(croppedImage);
      const blobImage = await base64.blob();
      console.log(blobImage);
      formdata.append("profilePic", blobImage);
    }
    console.log(data)
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
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["rolesData"],
    queryFn: async () => {
      const response = await api.get("/churches/roles");
      return response.data; // ✅ return the actual data
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

  console.log("MONEy")
  return (
    <DynamicSheet
      sheetOnOpenChange={sheetOnOpenChange}
      sheetConfig={{
        triggerButtonText: "Add Member",
        triggerButtonVariant: props.triggerButtonVariant,
      }}
      gridConfig={{ size: 550, col: 1 }}
    >
      <>
        <form
          onSubmit={handleSubmit(submitHandlerFunction)}
          className="contents" // makes form not add extra box
        >
          {mutation.isPending && (
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
            className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4`}
          >
            {MemoizedAvatarUploadCropperContent}
            <div className="grid gap-3">
              <AvatarUploadButton isRequired={true} setValue={setValue} control={control} >
                {errors.profilePic && (
                  <div className="text-red-500 text-sm">
                    {errors.profilePic.message}
                  </div>
                )}
              </AvatarUploadButton>
              <Label htmlFor="userName"> Username: </Label>
              <Input id="userName"  {...register("userName", {
                required: 'Username is required'
              })} />
              {errors.userName && (
                <div className="text-red-500 text-sm">
                  {errors.userName.message}
                </div>
              )}
              <Label htmlFor="password"> Password: </Label>
              <Input id="password"  {...register("password", {
                required: 'Password is required'
              })} />{errors.password && (
                <div className="text-red-500 text-sm">
                  {errors.password.message}
                </div>
              )}
              <Label htmlFor="phone">Phone:</Label>
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
              )}

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
              )}
            </div>
            <Label htmlFor="role">Roles:</Label>
            <Controller
              name="role"
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
            {errors.role && (
              <div className="text-red-500 text-sm">
                {errors.role.message}
              </div>
            )}
          </div>
          <SheetFooter>
            <Button type="submit" className="w-full">
              Submit
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </>
    </DynamicSheet >
  );
};
