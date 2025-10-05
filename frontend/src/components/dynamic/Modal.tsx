import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";

export function Modal({ open, onOpenChange, children, triggerButtonContent, triggerButtonVariant }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant={triggerButtonVariant}>{triggerButtonContent}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6 print:block print:shadow-none print:border-none">
                <DialogHeader className="print:hidden">
                    <DialogTitle className="text-xl font-semibold text-center">Profile Information</DialogTitle>
                    <DialogDescription>
                        Click on the button below to print the profile information
                    </DialogDescription>
                </DialogHeader>


                {children}


            </DialogContent>
        </Dialog>
    );
}
