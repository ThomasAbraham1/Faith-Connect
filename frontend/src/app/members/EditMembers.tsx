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
import type { MouseEventHandler } from "react";
import { useForm } from "react-hook-form";

type formDataType = {
  userName: string;
  password: string;
};

// Children is edit icon, username and password are extracted from table and passed as default values
export const EditMembers = (props: {
  children: React.ReactNode;
  userName: string;
  password: string;
  id: string;
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
  } = useForm<formDataType>({
    defaultValues: {
      userName: props.userName,
      password: props.password,
    },
  });
  const { userName, password } = watch();

  const submitHandlerFunction = async (data: formDataType) => {
    const member = mutation.mutate(data);
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: formDataType) => {
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

  return (
    <DynamicSheet
      sheetConfig={{
        // Passing to trigger button the Edit Icon from table
        triggerButtonText: props.children,
        triggerButtonVariant: props.triggerButtonVariant,
      }}
      gridConfig={{ size: 550, col: 1 }}
    >
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
        <div className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4`}>
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
