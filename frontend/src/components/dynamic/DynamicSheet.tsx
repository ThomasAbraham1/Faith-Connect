import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MouseEventHandler, ReactElement } from "react";
import { useForm } from "react-hook-form";
export type sheetConfig = {
  triggerButtonText: string | React.ReactNode;
  triggerButtonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
};

// Handler function type
export type submitHandlerFunction = (data: {
  userName: string;
  password: string;
}) => void;
export type gridConfig = {
  size: number;
  col: number;
};

export type inputFieldsConfig = {
  inputId: string;
  inputDisplayName: string;
  defaultValue: string;
}[];

export type sheetType = {
  sheetConfig: sheetConfig;
  gridConfig: gridConfig;
  sheetOnOpenChange?: (open: boolean) => void
  children: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void
};

const demoInputFields: inputFieldsConfig = [
  {
    inputId: "demo-name",
    defaultValue: "Jesus Christ",
    inputDisplayName: "Name",
  },
  {
    inputId: "demo-username",
    defaultValue: "christJesus",
    inputDisplayName: "Username",
  },
];

const demoSheetNaming: sheetConfig = {
  triggerButtonText: "Open",
};

const demoGridConfig: gridConfig = {
  size: 550,
  col: 1,
};

export function DynamicSheet({
  sheetConfig = demoSheetNaming,
  children,
  gridConfig,
  sheetOnOpenChange,
  open,
  onOpenChange
}: sheetType) {
  // console.log('gridConfig:', gridConfig)
  return (
    <Sheet open={open} onOpenChange={sheetOnOpenChange? sheetOnOpenChange : onOpenChange}>
      <SheetTrigger asChild>
        {/* <Button variant={sheetConfig.triggerButtonVariant}>{sheetConfig.triggerButtonText}</Button> */}
      </SheetTrigger>
      <SheetContent className={`w-80 sm:w-140 overflow-y-auto`}>
        {children}
      </SheetContent>
    </Sheet>
  );
}
