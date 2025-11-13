// ModalProvider.tsx
import { createContext, useContext, useState } from "react";
import ReactDOM from "react-dom";
import { DynamicSheet } from "./DynamicSheet";
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";

const ModalContext = createContext<any>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<any>(null);
    const [open, setopen] = useState<any>(true);

    const showModal = (content: any) => {
        return new Promise((resolve) => {
            setModal({ content, resolve });
        });
    };

    const closeModal = async (result: any) => {
        modal?.resolve(result);
        // setopen(false);
        setModal(null); // ✅ remove timeout
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            {
                ReactDOM.createPortal(
                    <DynamicSheet
                        open={modal !== null}
                        // onOpenChange={(open) => {
                        //     onOpenChange?.(open);
                        //     // sheetOnOpenChange(open); // still reset form on close
                        // }}
                        // sheetConfig={{
                        //     triggerButtonText: trigger,
                        //     triggerButtonVariant: triggerVariant,
                        // }}
                        gridConfig={{ size: 550, col: 1 }} // you can expose this as prop if you like
                    >
                        <>
                            <SheetHeader>
                                <SheetTitle>{'title'}</SheetTitle>
                                <SheetDescription>
                                    {/* {description && description} */}
                                    'test'
                                </SheetDescription>
                            </SheetHeader>
                            {/* <FormProvider {...methods}> */}
                            {/* <form onSubmit={handleSubmit(onSubmit)} className="contents"> */}
                            {/* Loading overlay */}
                            {/* {(isSubmitting || mutation.isPending) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                            <LoadingSpinner />
                        </div>
                    )} */}

                            {/* Body – user supplies the fields */}
                            {
                                // children(methods)
                                // children
                                modal?.content
                            }
                            {/* <SheetFooter className="sticky bottom-0 bg-background z-10">
                                <Button type="submit" className="w-full" onClick={() => closeModal(true)}>
                                    Submit
                                </Button>
                                <SheetClose asChild>
                                    <Button variant="outline" onClick={() => closeModal(false)} >Close</Button>
                                </SheetClose>
                            </SheetFooter> */}
                            {/* </form> */}
                            {/* </FormProvider> */}
                        </>

                    </DynamicSheet>

                    ,
                    document.body
                )}
        </ModalContext.Provider>
    );
}

export const useModal = () => useContext(ModalContext);
