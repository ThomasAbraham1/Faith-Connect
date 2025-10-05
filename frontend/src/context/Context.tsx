import { CropProvider } from "./CropProvider"

export const ContextProvider = ({ children }) => {
    return (
        <CropProvider>
            {children}
        </CropProvider>
    )
}