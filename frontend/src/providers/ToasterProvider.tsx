import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  return (
    <>
      {children}
      <Toaster position={isMobile ? "bottom-center" : "top-center"} />
    </>
  );
};
