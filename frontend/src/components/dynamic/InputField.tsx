import type { FieldError, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form"
import { Input } from "../ui/input";
import { Label } from '@/components/ui/label';
import * as lodash from "lodash";


interface InputFieldProps<T extends FieldValues> {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    fieldName: Path<T>;
    required: string;
}

export const InputField = <T extends FieldValues>({ register,
    errors, fieldName, required }: InputFieldProps<T>) => {
    return (
        <div className="grid gap-3">
            <Label htmlFor={fieldName}>{lodash.startCase(fieldName)}:</Label>
            <Input id="firstName"  {...register(fieldName, { required })} />{errors && (
                <div className="text-red-500 text-sm">
                    {errors[fieldName]?.message as string}
                </div>
            )}
        </div>
    )
}