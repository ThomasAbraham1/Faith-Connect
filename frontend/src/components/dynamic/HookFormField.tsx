import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";
import * as lodash from "lodash";


export const HookFormField = <T extends FieldValues,>({ fieldName, children, gridProp = 'half', errors }: { fieldName: keyof T & string, children: ReactNode, errors: FieldErrors<T>, gridProp?: 'half' | 'full' }) => {

    const fieldError = errors[fieldName] as
        | { message?: string | undefined }
        | undefined;

    return (
        <div className={`grid gap-6 ${gridProp == 'full' ? 'sm:col-span-2' : 'sm:col-span-1'} `}>
            <div className="grid gap-3">
                <Label htmlFor="eventDate">{lodash.startCase(fieldName)}</Label>
                {children}
                {fieldError && (
                    <p className="text-red-500 text-xs">{fieldError.message}</p>
                )}
            </div>
        </div>
    )
}