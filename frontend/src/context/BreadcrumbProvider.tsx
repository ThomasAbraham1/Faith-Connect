import React, { createContext, useContext, useState, type ReactNode } from "react";

interface BreadcrumbContextType {
  labels: Record<string, string>;
  setLabel: (segment: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = (segment: string, label: string) => {
    setLabels((prev) => ({ ...prev, [segment]: label }));
  };

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
};
