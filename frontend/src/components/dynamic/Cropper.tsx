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

  const setCroppedImageFunction = (cropped: string) => {
    setCroppedImage(cropped);
    setSelectedFile(null);
  };

  const AvatarUploadCropperContent = () => {
    const { selectedFile, croppedImage } =
      useCrop();
    return (
      <div className="justify-items-center-safe">
        {selectedFile && (
          <DynamicCropper
            profilePic={selectedFile}
            onCropConfirmFunction={setCroppedImageFunction}
            onCropResetFunction={handleReset}
          />
        )}
        {croppedImage ? (
          <Avatar className="w-30 h-30">
            <AvatarImage src={croppedImage} alt="@shadcn" />
            <AvatarFallback>No Preview</AvatarFallback>
          </Avatar>
        ) : (
          !selectedFile && (
            <Avatar className="w-30 h-30">
              <AvatarImage alt="@shadcn" />
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

export const AvatarUploadButton = ({ setValue, control, children, isRequired }: {
  setValue: UseFormSetValue<any>,
  control: any,
  children: React.ReactNode,
  isRequired: boolean,
}) => {
  const { fileInputRef } = useCrop()
  const { setSelectedFile, setCroppedImage } =
    useCrop();
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("Hello")
    const file = event.target.files?.[0];
    if (file) {
      setValue("profilePic", event.target.files);
      setSelectedFile(file);
      setCroppedImage(null);
    }
  };
  return (
    <>
      <Label htmlFor="profilePic" > Profile Picture: </Label >
      <Controller control={control} name="profilePic"
        rules={isRequired ? { required: 'Profile Picture is required' } : {}}

        render={({
          field: { onChange, } }) => (
          <Input id="profilePic" ref={fileInputRef} type="file" onChange={(e) => {
            handleFileChange(e);
            // onChange(e.target.files); 
          }} >
          </Input>)} />
      {children}
    </>)
}
