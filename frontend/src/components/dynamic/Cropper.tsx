import { useRef, type ChangeEvent } from "react";
import { useCrop } from "@/context/CropProvider";
import { Controller, type UseFormSetValue } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "../ui/shadcn-io/image-crop";
import { get } from "lodash";
import { flushSync } from "react-dom";
import { dataURLtoFile } from "@/lib/utils";

type CropperProps = {
  profilePic: File;
  onCropConfirmFunction: (croppedImage: string) => void;
  onCropResetFunction: () => void;
};

export const useAvatarUploadHandler = (
  setValue: UseFormSetValue<any>,
  control: any
) => {
  const { setSelectedFile, setCroppedImage } =
    useCrop();
  const { fileInputRef } = useCrop()

  const handleReset = () => {
    setSelectedFile(null);
    setValue("profilePic", undefined);
    setCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const afterSubmitHandleReset = () => {
    setSelectedFile(null);
    setValue("profilePic", undefined);
    setCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }



  const setCroppedImageFunction = (cropped: string, fieldName: string = "profilePic") => {
    setCroppedImage(cropped);

    // Create a new File object from the cropped data URL
    const file = dataURLtoFile(cropped, "cropped-image.png");

    // Update the form with the new cropped file
    setValue(fieldName, file, { shouldDirty: true });

    setSelectedFile(null);
  };

  const AvatarUploadCropperContent = ({ fieldName = "profilePic" }: { fieldName?: string } = {}) => {
    const { selectedFile, croppedImage } =
      useCrop();
    return (
      <div className="justify-items-center-safe">
        {selectedFile && (
          <DynamicCropper
            profilePic={selectedFile}
            onCropConfirmFunction={(cropped) => setCroppedImageFunction(cropped, fieldName)}
            onCropResetFunction={handleReset}
          />
        )}
        {croppedImage ? (
          <Avatar className="w-30 h-30">
            <AvatarImage src={croppedImage} alt="Preview" />
            <AvatarFallback>No Preview</AvatarFallback>
          </Avatar>
        ) : (
          !selectedFile && (
            <Avatar className="w-30 h-30">
              <AvatarImage alt="Preview" />
              <AvatarFallback>No Preview</AvatarFallback>
            </Avatar>
          )
        )}
      </div>
    );
  }



  const DynamicCropper = (props: CropperProps) => (
    <div className="space-y-4">
      <ImageCrop
        aspect={1}
        circularCrop
        file={props.profilePic}
        maxImageSize={1024 * 1024}
        onCrop={props.onCropConfirmFunction}
      >
        <ImageCropContent className="max-w-md" />
        <div className="flex items-center gap-2">
          <ImageCropApply />
          <ImageCropReset />
          <Button
            onClick={props.onCropResetFunction}
            type="button"
            size="icon"
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </ImageCrop>
    </div>
  );

  return {
    handleReset,
    afterSubmitHandleReset,
    setCroppedImageFunction,
    AvatarUploadCropperContent,
    DynamicCropper,
  };
};

export const AvatarUploadButton = ({ setValue, control, getValues, children, isRequired, name = "profilePic", label = "Profile Picture:" }: {
  setValue: UseFormSetValue<any>,
  getValues: any,
  control: any,
  children?: React.ReactNode,
  isRequired?: boolean,
  name?: string,
  label?: string
}) => {
  const { fileInputRef } = useCrop()
  const { setSelectedFile, setCroppedImage } =
    useCrop();
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Update RHF immediately
    setValue(name, file, { shouldDirty: true });

    // 2. Force selectedFile to be set BEFORE cropper reads it
    flushSync(() => {
      setSelectedFile(file);
    });

    // 3. Now safely reset cropped image
    setCroppedImage(null);
  };
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller control={control} name={name}
        render={({
          field: { onChange, } }) => (
          <Input id={name} ref={fileInputRef} type="file" onChange={(e) => {
            handleFileChange(e);
          }} />
        )} />
      {children}
    </div>
  )
}
