import React, { useContext, type ReactNode } from "react";


type CRUDSheetContextType ={
    editingData: Record<string, unknown> | null;
    setEditingData: (mode: Record<string, unknown> | null) => void;
    sheetOpen: boolean;
    setSheetOpen: (open: boolean) => void;
}
const crudSheetContext = React.createContext<CRUDSheetContextType | undefined>(undefined);

export const CRUDSheetProvider = ({children}: {children: ReactNode}) =>{
const [editingData, setEditingData] = React.useState<Record<string, unknown> | null>(null);
const [sheetOpen, setSheetOpen] = React.useState<boolean>(false);

return(
    <crudSheetContext.Provider value={{editingData, setEditingData, sheetOpen, setSheetOpen}}>
        {children}
    </crudSheetContext.Provider>
)
}

export const useCRUDSheet = (): CRUDSheetContextType => {
    const context = useContext(crudSheetContext);
    if (!context) {
        throw new Error("useCRUDSheet must be used within a CRUDSheetProvider");
    }
    return context;
}