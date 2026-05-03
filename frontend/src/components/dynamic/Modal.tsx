import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";

export function Modal({ open, onOpenChange, children, triggerButtonContent, triggerButtonVariant, triggerClassName, modelTitle, modelDescription, contentClassName }:any) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant={triggerButtonVariant} className={triggerClassName}>{triggerButtonContent}</Button>
            </DialogTrigger>
            <DialogContent className={`p-6 print:block print:shadow-none print:border-none max-h-[90vh] overflow-y-auto custom-scrollbar ${contentClassName || 'max-w-md'}`}>
                <DialogHeader className="print:hidden ">
                    <DialogTitle className="text-xl font-semibold text-center">{modelTitle}</DialogTitle>
                    <DialogDescription>
                        {modelDescription}
                    </DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
