/* src/components/dynamic/CrudSheet.tsx */
import { Button } from "@/components/ui/button";
import { DynamicSheet } from "@/components/dynamic/DynamicSheet";
import LoadingSpinner from "@/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import {
    FormProvider,
    useForm,
    type UseFormReturn,
    type FieldValues,
    type Path,
    type DefaultValues,
} from "react-hook-form";
import { toast } from "sonner";
import api from "@/api/api";
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import type { TEventsData } from "@/app/events/types/events.types";
import { useCrop } from "@/context/CropProvider";

type CrudSheetProps<T extends FieldValues> = {
    /** Unique id when editing – undefined for “add” */
    id?: string;

    /** Human readable title for the sheet */
    title: string;

    /** Optional description */
    description?: string;

    /** Text (or JSX) for the trigger button */
    trigger: string;

    /** Variant for the trigger button */
    triggerVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;

    /** Default values (used for edit) */
    defaultValues: DefaultValues<T>;

    /** POST endpoint for add – e.g. "/members" */
    addEndpoint: string;

    /** PATCH endpoint for edit – e.g. (id) => `/members/${id}` */
    editEndpoint: (id: string) => string;

    /** Query keys that must be invalidated after success */
    invalidateQueries: string[];

    /** Render the form fields – you have full control */
    children: (form: UseFormReturn<T>) => ReactNode;

    /** Optional: customise how FormData is built (advanced) */
    buildFormData?: (data: T, dirty: Partial<T>) => FormData;

    /** Optional: custom success / error handlers */
    onSuccess?: () => void;
    onError?: (err: any) => void;

    // Set data build type - FormData or json
    multipart?: boolean

    open?: boolean;
    onOpenChange?: (open: boolean) => void;

};

export function CrudSheet<T extends FieldValues>({
    id,
    title,
    description,
    trigger,
    triggerVariant,
    defaultValues,
    addEndpoint,
    editEndpoint,
    invalidateQueries,
    multipart = false,
    open,
    onOpenChange,
    children,
    buildFormData,
    onSuccess,
    onError,
}: CrudSheetProps<T>) {
    const isEdit = !!id;
    const queryClient = useQueryClient();
    const methods = useForm<T>(
        { defaultValues: defaultValues }
    );
    const { setCroppedImage } = useCrop()

        useEffect(() => {
            if (defaultValues) {
                methods.reset(defaultValues);
            }
        }, [defaultValues, methods]);
    const { reset, formState, handleSubmit, setValue } = methods;
    const { dirtyFields, isSubmitting } = formState;
    // console.log(defaultValues, 'defaultValues');
    // -----------------------------------------------------------------
    // 1. Mutation – add or edit
    // -----------------------------------------------------------------
    const mutation = useMutation({
        mutationFn: (fd: FormData | T) => {
            const url = isEdit ? editEndpoint(id!) : addEndpoint;
            const method = isEdit ? api.patch : api.post;
            return method(url, fd);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Updated successfully" : "Created successfully");
            queryClient.invalidateQueries({ queryKey: invalidateQueries });
            setCroppedImage(null);
            reset(); // clear form
            onSuccess?.();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Something went wrong");
            onError?.(err);
        },
    });

    // -----------------------------------------------------------------
    // 2. Build FormData (default = dirty fields only for edit)
    // -----------------------------------------------------------------
    const defaultBuildData = (data: T, dirty: Partial<T>) => {

        // When editing we only send dirty fields (including blobs)

        const fields = isEdit ? dirty : data;
        if (multipart) {
            const fd = new FormData();
            for (const key in fields) {
                const value = (data as any)[key];
                if (value === undefined) continue;

                // Blob / FileList handling
                if (value instanceof Blob) {
                    fd.append(key, value);
                } else if (value instanceof FileList && value.length) {
                    fd.append(key, value[0]);
                } else {
                    fd.append(key, String(value));
                }
            }
            return fd;
        }

        // JSON data building
        var jsonData: T = {} as T
        for (const key in fields) {
            const value = (data)[key]
            if (value === undefined) continue;
            else {
                jsonData[key] = value
            }
        }
        return jsonData

    }


    const onSubmit = (data: T) => {
        console.log(data)
        const processedData = defaultBuildData(data, dirtyFields as Partial<T>)

        if (processedData instanceof FormData) {
            console.log("FormData content:");
            processedData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
        } else {
            // mutation.mutate(processedData);
            for (const [key, value] of Object.entries(processedData)) {
                console.log(`${key}: ${value}`);
            }
        }
        mutation.mutate(processedData);
        console.log(processedData, "Processed Data");
    };

    return (
        <DynamicSheet
            open={open}
            onOpenChange={(open) => {
                onOpenChange?.(open);
                // sheetOnOpenChange(open); // still reset form on close
            }}
            sheetConfig={{
                triggerButtonText: trigger,
                triggerButtonVariant: triggerVariant,
            }}
            gridConfig={{ size: 550, col: 1 }} // you can expose this as prop if you like
        >
            <>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description && description}
                    </SheetDescription>
                </SheetHeader>
                {/* <FormProvider {...methods}> */}
                <form onSubmit={handleSubmit(onSubmit)} className="contents">
                    {/* Loading overlay */}
                    {(isSubmitting || mutation.isPending) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                            <LoadingSpinner />
                        </div>
                    )}

                    {/* Body – user supplies the fields */}
                    <div className="grid gap-6 p-4">{children(methods)}
                    </div>
                    <SheetFooter className="sticky bottom-0 bg-background z-10">
                        <Button type="submit" className="w-full">
                            Submit
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
                {/* </FormProvider> */}
            </>

        </DynamicSheet>
    );
}