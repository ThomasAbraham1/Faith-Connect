import api from "@/api/api";
import { DynamicSheet } from "@/components/dynamic/DynamicSheet";
import LoadingSpinner from "@/components/spinner";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Profiler, useEffect, type MouseEventHandler } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type formDataType = {
  userName: string;
  password: string;
  profilePic: FileList;
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
    setValue,
    formState: { errors },
  } = useForm<formDataType>();
  var { userName, password, profilePic } = watch();

  console.log(profilePic);

  const submitHandlerFunction = async (data: formDataType) => {
    // const member = mutation.mutate(data);
    // console.log(profilePic[0]);
    // console.log(data.profilePic[0]);
    // const file = data.profilePic[0];
    // const resizeFile = async (file) =>
    //   new Promise((resolve) => {
    //     Resizer.imageFileResizer(
    //       file,
    //       300,
    //       300,
    //       "JPEG",
    //       100,
    //       0,
    //       (uri) => {
    //         resolve(uri);
    //       },
    //       "base64"
    //     );
    //   });
    // setValue("profilePic", await resizeFile(file));
    // console.log(profilePic);
  };
  // queryClient for mutating the table data query
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: formDataType) => {
      return api.post("/members", data);
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

  return (
    <DynamicSheet
      sheetConfig={{
        triggerButtonText: "Add Member",
        triggerButtonVariant: props.triggerButtonVariant,
      }}
      gridConfig={{ size: 550, col: 1 }}
    >
      <form
        onSubmit={handleSubmit(submitHandlerFunction)}
        className="contents" // makes form not add extra box
      >
        <SheetHeader>
          <SheetTitle>Enter member details</SheetTitle>
          <SheetDescription>
            Add member details and click on save
          </SheetDescription>
        </SheetHeader>
        <div className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4`}>
          <div className="justify-items-center-safe">
            <Avatar className="w-30 h-30">
              <AvatarImage
                src={profilePic[0] as unknown as string}
                alt="@shadcn"
              />
              <AvatarFallback>CNasdas</AvatarFallback>
            </Avatar>
          </div>
          <Input
            id="profilePic"
            type="file"
            {...register("profilePic", {
              required: true,
            })}
          ></Input>
          <div className="grid gap-3">
            <Label htmlFor="userName"> Username: </Label>
            <Input
              id="userName"
              defaultValue=""
              value={userName}
              {...register("userName")}
            />
            <Label htmlFor="password"> Password: </Label>
            <Input
              id="password"
              defaultValue=""
              value={password}
              {...register("password")}
            />
          </div>
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
    </DynamicSheet>
  );
};
