import type { ReactNode } from "react"
import { CropProvider } from "./CropProvider"
import { UserProvider } from "./UserProvider"
import { CRUDSheetProvider } from "./CRUDSheetProvider"
import { BreadcrumbProvider } from "./BreadcrumbProvider"

export const ContextProvider = ({ children }: { children: ReactNode }) => {
    return (
        <UserProvider>
            <CRUDSheetProvider>
                <BreadcrumbProvider>
                    <CropProvider>
                        {children}
                    </CropProvider>
                </BreadcrumbProvider>
            </CRUDSheetProvider>
        </UserProvider>
    )
}