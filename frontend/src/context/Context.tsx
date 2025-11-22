import type { ReactNode } from "react"
import { CropProvider } from "./CropProvider"
import { UserProvider } from "./UserProvider"
import { CRUDSheetProvider } from "./CRUDSheetProvider"

export const ContextProvider = ({ children }: { children: ReactNode }) => {
    return (
        <UserProvider>
            <CRUDSheetProvider>
                <CropProvider>
                    {children}
                </CropProvider>
            </CRUDSheetProvider>
        </UserProvider>
    )
}