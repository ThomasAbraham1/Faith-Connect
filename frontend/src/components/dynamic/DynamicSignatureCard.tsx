import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import type { UseMutationResult } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { SignatureMaker } from '@docuseal/signature-maker-react';
import { Button } from "../ui/button";


interface SignatureCardProps {
    // onSignatureSave?: (base64: string) => void; // Optional callback for saving the signature
    postSignatureMutation?: UseMutationResult<AxiosResponse<any, any>, Error, any, unknown>,
    onChange?: (value: Blob) => void,
    value: Blob | string
}
/**
 * A reusable signatureCard component that handles formatting the user signature.
 * @param {object} props.onChange - onChange ignores the postSignatureMutation callback and passes the changed value to the callback function
 * @param {string} props.value - keeps the signatureBase64 value updated
 */

export function SignatureCard({ postSignatureMutation, onChange, value }: SignatureCardProps) {
    const [signatureBase64, setSignatureBase64] = useState<string | null | Blob | undefined>(value);

    useEffect(() => {
        console.log(signatureBase64);
    }, [signatureBase64])
    const handleSignatureChange = (event: any) => {
        setSignatureBase64(`data:image/png;base64,${event.base64}`);
    };



    const handleSave = async () => {
        if (!signatureBase64) return alert("Please sign first!");
        // Convert base64 to Blob (simpler way using fetch)
        const blob = await (await fetch(signatureBase64)).blob();
        console.log(blob)
        if (!!onChange) {
            onChange(blob)
            return
        }
        const formData = new FormData();
        formData.append("signature", blob);
        postSignatureMutation?.mutate(formData);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-sm border-border">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Sign Here</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Draw, type, or upload your signature below.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                    <SignatureMaker
                        withSubmit={false} // Hide built-in save button; use external if needed
                        onChange={handleSignatureChange}
                        onSave={handleSave}
                        // downloadOnSave={true} // Auto-download on save (optional)
                        // Shadcn/Tailwind-friendly customizations
                        canvasClass="w-full h-32 bg-secondary border border-input bg-background  rounded-md p-2"
                        textInputClass="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
                        typeButtonsContainerClass="flex justify-center gap-2 mb-3"
                        drawTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        drawTypeButtonActiveClass="bg-primary text-primary-foreground"
                        textTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        textTypeButtonActiveClass="bg-primary text-primary-foreground"
                        uploadTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        uploadTypeButtonActiveClass="bg-primary text-primary-foreground"
                        undoButtonClass="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        clearButtonClass="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        textInputPlaceholder="Type your signature..."
                    />
                </div>
                {signatureBase64 && (
                    <div className="text-xs text-center text-muted-foreground">
                        Signature captured! Preview:
                            <img
                                src={`${signatureBase64}`}
                                alt="Member's Signature"
                                className="max-h-[50px] max-w-[200px] object-contain block mx-auto"
                                onError={() => console.error('Failed to load signature image')}
                            />
                            {signatureBase64.length > 50 ? `${signatureBase64.slice(0, 50)}...` : signatureBase64}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <div className="flex gap-2">

                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}