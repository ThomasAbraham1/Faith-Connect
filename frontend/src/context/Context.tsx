import type { ReactNode } from "react"
import { CropProvider } from "./CropProvider"
import { UserProvider } from "./UserProvider"

export const ContextProvider = ({ children }: { children: ReactNode }) => {
    return (
        <UserProvider>
            <CropProvider>
                {children}
            </CropProvider>
        </UserProvider>
    )
}