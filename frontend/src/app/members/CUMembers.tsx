import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { PhoneInput } from "@/components/phone-input";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/dynamic/Modal";
import { SignatureCard } from "@/components/dynamic/DynamicSignatureCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { FormDataType } from "./types/members.types";
import api from "@/api/api";
import { useCRUDSheet } from "@/context/CRUDSheetProvider";
// import { Button } from "@/components/ui/button";
import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import { useCrop } from "@/context/CropProvider";

type roleRecordType = {
    _id: string;
    name: string;
    Permissions: string[]
}

// Optional: pass member data when editing
type AddMembersProps = {
    data?: FormDataType | null;
    triggerVariant?: "default" | "outline" | "ghost";
    trigger?: string; // Allow override
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // onSuccess?: () => void;
};

export const CUMembers = ({
    data,
    triggerVariant,
    trigger,
    open,
    onOpenChange,
    // onSuccess
}: AddMembersProps) => {
    const isEdit = !!data?.id;
    const { setCroppedImage } = useCrop();

    useEffect(() => {

        if (isEdit && data?.profilePic) {
            setCroppedImage(`${import.meta.env.VITE_APP_API_URL}${data.profilePic}`)
        } else if (!isEdit) {
            setCroppedImage(null);
        }
    }, [isEdit, data, setCroppedImage]);

    const { sheetOpen, setSheetOpen } = useCRUDSheet();

    // Retrieving user roles
    const { data: rolesData, isPending: isRolesQueryPending } = useQuery({
        queryKey: ["rolesData"],
        queryFn: async () => {
            try {
                const response = await api.get("/churches/roles");
                return response.data;  // ✅ return the actual data
            } catch (err: any) {
                console.log(err.response.data.message)
                toast.error(err?.response?.data?.message || "Error fetching roles")
            }
        },
    });

    return (
        <>
            <CrudSheet<FormDataType>
                id={data?.id}
                title={trigger!}
                description={isEdit ? "Update member details" : "Create a new member"}
                trigger={trigger!}
                multipart={true}
                triggerVariant={triggerVariant}
                defaultValues={useMemo(() => ({
                    userName: data?.userName,
                    password: data?.password,
                    phone: data?.phone,
                    dateOfBirth: data?.dateOfBirth,
                    spiritualStatus: data?.spiritualStatus,
                    roles: data?.roles,
                    fatherName: data?.fatherName,
                    motherName: data?.motherName,
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    address: data?.address,
                }), [data])}

                addEndpoint="/members"
                editEndpoint={(id) => `/members/${id}`}
                invalidateQueries={["membersData"]}
                open={open ?? sheetOpen} // ← controlled
                onOpenChange={(newOpen) => {
                    if (onOpenChange) {
                        onOpenChange(newOpen);
                    } else {
                        setSheetOpen(newOpen);
                    }
                    if (!newOpen) {
                        // setEditingData(null);
                    }
                }} // ← controlled
            >

                {({ register, control, setValue, getValues, formState: { errors }, watch }) => (

                    <div className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4 `}>
                        {(() => {
                            const {
                                AvatarUploadCropperContent,
                            } = useAvatarUploadHandler(setValue, control);
                            return <AvatarUploadCropperContent />;
                        })()}
                        <AvatarUploadButton isRequired={true} setValue={setValue} getValues={getValues} control={control} >
                            {errors.profilePic && (
                                <div className="text-red-500 text-sm">
                                    {errors.profilePic.message}
                                </div>
                            )}
                        </AvatarUploadButton>
                        < div className="grid gap-6  sm:grid-cols-2 grid-rows-auto items-end">
                            <div className="grid gap-3">
                                <Label htmlFor="firstName">First Name: </Label>
                                <Input id="firstName"  {...register("firstName", {
                                    // required: 'First Name is required'
                                })} />{errors.firstName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.firstName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="lastName">Last name: </Label>
                                <Input id="lastName"  {...register("lastName", {
                                    // required: 'Last name is required'
                                })} />{errors.lastName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.lastName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="fatherName">Father Name: </Label>
                                <Input id="fatherName"  {...register("fatherName", {
                                    // required: 'Father Name is required'
                                })} />{errors.fatherName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.fatherName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="motherName">Mother Name: </Label>
                                <Input id="motherName"  {...register("motherName", {
                                    // required: 'Mother Name is required'
                                })} />{errors.motherName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.motherName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="userName">Username: </Label>
                                <Input id="userName"  {...register("userName", {
                                    // required: 'Username is required'
                                })} />
                                {errors.userName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.userName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password: </Label>
                                <Input id="password"  {...register("password", {
                                    // required: 'Password is required'
                                })} />{errors.password && (
                                    <div className="text-red-500 text-sm">
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="phone">Phone:</Label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    // rules={{ required: "Phone is required" }}
                                    render={({ field }) => (
                                        <PhoneInput {...field} placeholder="Enter a phone number" onChange={(value) => field.onChange(value)}></PhoneInput>
                                    )}
                                />
                                {errors.phone && (
                                    <div className="text-red-500 text-sm">
                                        {errors.phone.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="address">Address: </Label>
                                <Textarea id="address"  {...register("address", {
                                    required: 'address is required'
                                })} />{errors.address && (
                                    <div className="text-red-500 text-sm">
                                        {errors.address.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="dateOfBirth">Date of birth:</Label>
                                <Controller
                                    name="dateOfBirth"
                                    control={control}
                                    // rules={{ required: "Date of birth is required" }}
                                    render={({ field }) => (
                                        <DatePicker value={field.value as any as Date} className='w-full' onChange={(value) => {
                                            field.onChange(value)
                                        }}></DatePicker>
                                    )}
                                />
                                {errors.dateOfBirth && (
                                    <div className="text-red-500 text-sm">
                                        {errors.dateOfBirth.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">

                                <Label htmlFor="spiritualStatus">Spiritual Status:</Label>
                                <Controller
                                    name="spiritualStatus"
                                    control={control}
                                    // rules={{ required: "Spiritual status is required" }}
                                    render={({ field }) => (
                                        <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger className=" w-full">
                                                <SelectValue placeholder="Choose spiritual status" />
                                            </SelectTrigger>
                                            <SelectContent className='w-full'>
                                                <SelectItem value="BELIEVER">BELIEVER</SelectItem>
                                                <SelectItem value="UNDECIDED">UNDECIDED</SelectItem>
                                                <SelectItem value="SEEKER">SEEKER</SelectItem>
                                                <SelectItem value="NON_BELIEVER">NON_BELIEVER</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.spiritualStatus && (
                                    <div className="text-red-500 text-sm">
                                        {errors.spiritualStatus.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="role">Roles:</Label>
                                <Controller
                                    name="roles"
                                    control={control}
                                    rules={{ required: "Roles are required" }}
                                    render={({ field }) => (
                                        <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                                            <SelectTrigger className=" w-full">
                                                <SelectValue placeholder="Choose roles" />
                                            </SelectTrigger>
                                            <SelectContent className='w-full'>
                                                {!isRolesQueryPending &&
                                                    rolesData.data.map((roleRecord: roleRecordType) =>
                                                        <SelectItem key={roleRecord._id} value={roleRecord.name}>{roleRecord.name}</SelectItem>
                                                    )
                                                }
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.roles && (
                                    <div className="text-red-500 text-sm">
                                        {errors.roles.message}
                                    </div>
                                )}
                            </div>
                            {watch('roles') == 'pastor' &&
                                <div className="grid gap-3">
                                    <Controller
                                        name="signature"
                                        control={control}
                                        rules={{ required: "Signature is required for a pastor" }}
                                        render={({ field }) => (
                                            <Modal triggerButtonVariant={'outline'} triggerButtonContent={`${(watch('signature') ? 'Edit Signature' : 'Add Signature')}`} modelTitle={'Create your signature'}>
                                                <SignatureCard value={(field.value && URL.createObjectURL(field.value)) ?? undefined} onChange={(value: Blob) => {
                                                    // console.log(value + " ALSJLDJA");
                                                    field.onChange(value);
                                                    toast.success('Signature changed!')
                                                }}></SignatureCard>
                                            </Modal>
                                        )}
                                    />

                                    {errors.signature && (
                                        <div className="text-red-500 text-sm">
                                            {errors.signature.message}
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    </div>
                )}
            </CrudSheet >
        </>

    );
};
