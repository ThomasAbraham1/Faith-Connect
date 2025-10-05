import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
};
