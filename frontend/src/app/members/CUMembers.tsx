import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { PhoneInput } from "@/components/phone-input";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/dynamic/Modal";
import { SignatureCard } from "@/components/dynamic/DynamicSignatureCard";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormDataType } from "./types/members.types";
import api from "@/api/api";
import { useCRUDSheet } from "@/context/CRUDSheetProvider";
import { Button } from "@/components/ui/button";
import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import { useCrop } from "@/context/CropProvider";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home } from "lucide-react";

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
}: AddMembersProps) => {
    const isEdit = !!data?.id;
    const { setCroppedImage } = useCrop();
    const [selectedHousehold, setSelectedHousehold] = useState('');
    const [householdRole, setHouseholdRole] = useState('SPOUSE');
    const [familyName, setFamilyName] = useState('');

    // Pre-populate household state when editing
    useEffect(() => {
        if (isEdit && (data as any)?.householdId) {
            setSelectedHousehold((data as any).householdId);
            setHouseholdRole((data as any).householdRole || 'SPOUSE');
        } else if (!isEdit) {
            setSelectedHousehold('');
            setHouseholdRole('SPOUSE');
            setFamilyName('');
        }
    }, [isEdit, data]);

    const queryClient = useQueryClient();

    // After member create/edit, handle household assignment
    const handleMemberSaved = async (memberId: string) => {
        const targetId = memberId || data?.id;
        if (!targetId || !selectedHousehold || selectedHousehold === 'none') {
            toast.success(isEdit ? 'Member updated successfully' : 'Member created successfully');
            setSelectedHousehold('');
            setFamilyName('');
            return;
        }
        try {
            if (selectedHousehold === '__new__') {
                if (!familyName.trim()) return;
                // Create the household — this member becomes PRIMARY automatically
                await api.post('/households', { name: familyName.trim(), primaryContactId: targetId });
                // Also save the role label for this member
                await api.patch(`/members/${targetId}`, { householdRole });
            } else {
                // Assign to existing household
                await api.patch(`/households/${selectedHousehold}/members`, { addMembers: [targetId] });
                await api.patch(`/members/${targetId}`, { householdRole });
            }
            // Refresh data so the table and dropdowns see the new household assignment
            queryClient.invalidateQueries({ queryKey: ["membersData"] });
            queryClient.invalidateQueries({ queryKey: ["households"] });
            
            toast.success(isEdit ? 'Member updated successfully' : 'Member created successfully');
        } catch (e: any) {
            console.error('Household Assignment Error:', e);
            toast.error(e?.response?.data?.message || 'Member saved, but household assignment failed');
        }
        setSelectedHousehold('');
        setHouseholdRole('SPOUSE');
        setFamilyName('');
    };

    useEffect(() => {

        if (isEdit && data?.profilePic && typeof data.profilePic === 'string') {
            const picUrl = data.profilePic.startsWith('http')
                ? data.profilePic
                : `${import.meta.env.VITE_APP_API_URL}${data.profilePic}`;
            setCroppedImage(picUrl)
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
                return response.data;
            } catch (err: any) {
                console.log(err.response.data.message)
                toast.error(err?.response?.data?.message || "Error fetching roles")
            }
        },
    });

    // Retrieving households for the assignment dropdown
    const { data: householdsData } = useQuery({
        queryKey: ["households"],
        queryFn: async () => {
            const res = await api.get("/households");
            return res.data.data || [];
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
                    anniversaryDate: data?.anniversaryDate,
                    spiritualStatus: data?.spiritualStatus,
                    roles: data?.roles,
                    fatherName: data?.fatherName,
                    motherName: data?.motherName,
                    firstName: data?.firstName,
                    lastName: data?.lastName,
                    email: data?.email,
                    address: data?.address,
                }), [data])}

                addEndpoint="/members"
                editEndpoint={(id) => `/members/${id}`}
                invalidateQueries={["membersData"]}
                open={open ?? sheetOpen}
                suppressToast={true}
                onOpenChange={(newOpen) => {
                    if (onOpenChange) {
                        onOpenChange(newOpen);
                    } else {
                        setSheetOpen(newOpen);
                    }
                }}
                onSuccess={async (response?: any) => {
                    const newMemberId = response?.data?._id || response?.data?.data?._id || data?.id;
                    if (newMemberId) await handleMemberSaved(newMemberId);
                }}
            >

                {({ register, control, setValue, getValues, formState: { errors }, watch }) => (

                    <div className={`grid grid-cols-1 sm:grid-cols-1 auto-cols gap-6 px-4 `}>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs text-muted-foreground border-dashed"
                                onClick={() => {
                                    setValue('firstName', 'John');
                                    setValue('lastName', 'Doe');
                                    setValue('userName', 'johndoe');
                                    setValue('password', 'password123'); // Demo password
                                    setValue('phone', '+15550109999');
                                    setValue('dateOfBirth', '1990-01-01');
                                    setValue('email', 'cta102938@gmail.com');
                                    setValue('address', '123 Maple Street');
                                    setValue('spiritualStatus', 'SEEKER');
                                    setValue('fatherName', 'Robert Doe');
                                    setValue('motherName', 'Mary Doe');
                                    // Roles might need to be fetched, but 'member' or 'visitor' if available
                                    // setValue('roles', 'member'); 
                                    toast.info("Demo Data Filled: Visitor 'John Doe'");
                                }}
                            >
                                ✨ Demo Fill
                            </Button>
                        </div>
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
                                <Label htmlFor="firstName">First Name: <span className="text-red-500">*</span></Label>
                                <Input id="firstName"  {...register("firstName", {
                                    required: 'First Name is required'
                                })} />{errors.firstName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.firstName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="lastName">Last Name: <span className="text-red-500">*</span></Label>
                                <Input id="lastName"  {...register("lastName", {
                                    required: 'Last Name is required'
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
                                <Input id="userName"  {...register("userName")} />
                                {errors.userName && (
                                    <div className="text-red-500 text-sm">
                                        {errors.userName.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password: </Label>
                                <Input id="password" type="password" {...register("password")} />
                                {errors.password && (
                                    <div className="text-red-500 text-sm">
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="phone">Phone: <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{ required: "Phone is required" }}
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
                                <Label htmlFor="email">Email: <span className="text-red-500">*</span></Label>
                                <Input id="email"  {...register("email", {
                                    required: 'Email is required'
                                })} />{errors.email && (
                                    <div className="text-red-500 text-sm">
                                        {errors.email.message}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="address">Address: </Label>
                                <Textarea id="address"  {...register("address")} />
                                {errors.address && (
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
                                    render={({ field }) => (
                                        <DatePicker value={field.value ? new Date(field.value) : undefined} className='w-full' onChange={(value) => {
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
                                <Label htmlFor="anniversaryDate">Anniversary:</Label>
                                <Controller
                                    name="anniversaryDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker 
                                            value={field.value ? new Date(field.value) : undefined} 
                                            className='w-full' 
                                            onChange={(value) => {
                                                field.onChange(value)
                                            }}
                                        />
                                    )}
                                />
                                {errors.anniversaryDate && (
                                    <div className="text-red-500 text-sm">
                                        {errors.anniversaryDate.message}
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
                                <Label htmlFor="role">Roles: <span className="text-red-500">*</span></Label>
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

                        {/* ── Household Section ── */}
                        <>
                            <Separator />
                            <div className="grid gap-4">
                                <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-semibold">Household <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Family</Label>
                                    <Select
                                        value={selectedHousehold}
                                        onValueChange={setSelectedHousehold}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No household assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— No household —</SelectItem>
                                            <SelectItem value="__new__">✦ Create new family for this member</SelectItem>
                                            {(householdsData || []).map((h: any) => (
                                                <SelectItem key={h._id} value={h._id}>
                                                    {h.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>


                                {/* Create new family: show name input + role */}
                                {selectedHousehold === '__new__' && (
                                    <div className="grid gap-3">
                                        <div className="grid gap-2">
                                            <Label>Family Name</Label>
                                            <Input
                                                placeholder="e.g. The Abraham Family"
                                                value={familyName}
                                                onChange={(e) => setFamilyName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>My Role in This Family</Label>
                                            <RadioGroup
                                                value={householdRole}
                                                onValueChange={setHouseholdRole}
                                                className="flex gap-4 flex-wrap"
                                            >
                                                {['PRIMARY', 'SPOUSE', 'CHILD', 'DEPENDENT'].map((role) => (
                                                    <div key={role} className="flex items-center gap-2">
                                                        <RadioGroupItem value={role} id={`new-role-${role}`} />
                                                        <Label htmlFor={`new-role-${role}`} className="font-normal capitalize cursor-pointer">
                                                            {role === 'PRIMARY' ? 'Head of Family' : role.charAt(0) + role.slice(1).toLowerCase()}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            <p className="text-xs text-muted-foreground">
                                                The family will be created with this member as <strong>Primary Contact</strong>. The role label defines how this member appears in the family.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Assign to existing household: show role picker */}
                                {selectedHousehold && selectedHousehold !== 'none' && selectedHousehold !== '__new__' && (
                                    <div className="grid gap-2">
                                        <Label>Role in Family</Label>
                                        <RadioGroup
                                            value={householdRole}
                                            onValueChange={setHouseholdRole}
                                            className="flex gap-4 flex-wrap"
                                        >
                                            {['SPOUSE', 'CHILD', 'DEPENDENT'].map((role) => (
                                                <div key={role} className="flex items-center gap-2">
                                                    <RadioGroupItem value={role} id={`role-${role}`} />
                                                    <Label htmlFor={`role-${role}`} className="font-normal capitalize cursor-pointer">
                                                        {role.charAt(0) + role.slice(1).toLowerCase()}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                            </div>
                        </>

                    </div>
                )}
            </CrudSheet >
        </>

    );
};
