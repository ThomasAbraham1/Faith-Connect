import { createContext, useContext, useState, type ReactNode, useRef, type RefObject } from "react";

type CropContextType = {
    selectedFile: File | null;
    fileInputRef: RefObject<HTMLInputElement | null>;
    setSelectedFile: (file: File | null) => void;
    croppedImage: string | null;
    setCroppedImage: (image: string | null) => void;
};

const CropContext = createContext<CropContextType | undefined>(undefined);

export const CropProvider = ({ children }: { children: ReactNode }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
 
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    return (
        <CropContext.Provider
            value={{ selectedFile, setSelectedFile, croppedImage, fileInputRef, setCroppedImage }}
        >
            {children}
        </CropContext.Provider>
    );
};

export const useCrop = (): CropContextType => {
    const context = useContext(CropContext);
    if (!context) {
        throw new Error("useCrop must be used within a CropProvider");
    }
    return context;
};
