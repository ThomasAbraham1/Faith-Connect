import React from "react";
import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { InputField } from "@/components/dynamic/InputField";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import type { CreateGroupDto, GroupCategory } from "./types/groups.types";

interface CUGroupProps {
  id?: string;
  trigger: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
  defaultValues?: Partial<CreateGroupDto>;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CUGroup: React.FC<CUGroupProps> = ({
  id,
  trigger,
  triggerVariant = "default",
  defaultValues = { name: "", category: "REGION" as GroupCategory },
  onSuccess,
  open,
  onOpenChange
}) => {
  return (
    <CrudSheet<CreateGroupDto>
      id={id}
      title={id ? "Edit Group" : "Create New Group"}
      description="Fill in the details to organize your group."
      trigger={trigger}
      triggerVariant={triggerVariant}
      defaultValues={defaultValues as any}
      addEndpoint="/groups"
      editEndpoint={(id) => `/groups/${id}`}
      invalidateQueries={["groups"]}
      onSuccess={onSuccess}
      open={open}
      onOpenChange={onOpenChange}
    >
      {({ register, control, formState: { errors } }) => (
        <div className="space-y-6 px-4">
          <InputField
            label="Group Name"
            fieldName="name"
            register={register}
            errors={errors}
            placeholder="e.g. North Region, Youth Ministry"
            required="Name is required"
          />
          
          <div className="grid gap-3">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Category:
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  className="flex flex-row gap-6 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="REGION" id="r-region" />
                    <Label htmlFor="r-region" className="font-normal cursor-pointer">Region</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MINISTRY" id="r-ministry" />
                    <Label htmlFor="r-ministry" className="font-normal cursor-pointer">Ministry</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </div>
      )}
    </CrudSheet>
  );
};
