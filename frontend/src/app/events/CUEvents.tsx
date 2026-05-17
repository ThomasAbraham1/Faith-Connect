import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TEventsData } from "./types/events.types";
import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AvatarUploadButton, useAvatarUploadHandler } from "@/components/dynamic/Cropper";
import { useCrop } from "@/context/CropProvider";

// Optional: pass event data when editing
type AddEventsProps = {
    data?: TEventsData | null;
    triggerVariant?: "default" | "outline" | "ghost";
    trigger?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
};

export const CUEvents = ({
    data,
    triggerVariant,
    trigger,
    open,
    onOpenChange,
    onSuccess
}: AddEventsProps) => {
    const eventId = data?.id || (data as any)?._id;
    const isEdit = !!eventId;
    const { setCroppedImage } = useCrop();

    // Fetch groups for the invitation checklist
    const { data: groups } = useQuery({
        queryKey: ["groups-list"],
        queryFn: () => api.get("/groups").then(r => r.data.data)
    });

    // When editing, pre-load the existing cover image into the cropper preview
    useEffect(() => {
        if (isEdit && (data as any)?.coverImageUrl) {
            const url = (data as any).coverImageUrl;
            const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_APP_API_URL}${url}`;
            setCroppedImage(fullUrl);
        } else if (!isEdit) {
            setCroppedImage(null);
        }
    }, [isEdit, data, setCroppedImage]);

    return (
        <CrudSheet<TEventsData>
            id={eventId}
            title={trigger!}
            description={isEdit ? "Update event details" : "Create a new event"}
            trigger={trigger!}
            triggerVariant={triggerVariant}
            multipart={true}
            defaultValues={useMemo(() => {
                const rawStart = data?.startDate ?? (data as any)?.eventDate ?? "";
                const rawEnd = data?.endDate ?? "";
                
                let startTime = "";
                let endTime = "";
                
                if (rawStart) {
                    const startObj = new Date(rawStart);
                    const hasStartTime = startObj.getHours() !== 0 || startObj.getMinutes() !== 0;
                    if (hasStartTime) {
                        startTime = startObj.toTimeString().slice(0, 5);
                    }
                }
                
                if (rawEnd) {
                    const endObj = new Date(rawEnd);
                    const hasEndTime = endObj.getHours() !== 0 || endObj.getMinutes() !== 0;
                    if (hasEndTime) {
                        endTime = endObj.toTimeString().slice(0, 5);
                    }
                }

                if ((data as any)?.startTime) startTime = (data as any).startTime;
                if ((data as any)?.endTime) endTime = (data as any).endTime;

                return {
                    eventName: data?.eventName ?? "",
                    description: data?.description ?? "",
                    startDate: rawStart ? new Date(rawStart) : "",
                    endDate: rawEnd ? new Date(rawEnd) : "",
                    startTime: startTime || null,
                    endTime: endTime || null,
                    invitedGroups: data?.invitedGroups ?? [],
                    eventLocation: data?.eventLocation ?? "",
                    organizer: data?.organizer ?? "",
                    isRecurring: data?.isRecurring ?? false,
                    recurrenceType: data?.recurrenceType ?? 'WEEKLY',
                    recurrenceDay: data?.recurrenceDay ?? "",
                    recurrenceEndDate: data?.recurrenceEndDate ?? "",
                    registrationFee: (data as any)?.registrationFee ?? "",
                } as any;
            }, [data])}
            buildFormData={(formDataValues, dirty) => {
                const fd = new FormData();
                
                const startDateObj = formDataValues.startDate ? new Date(formDataValues.startDate) : new Date();
                if (formDataValues.startTime) {
                    const [h, m] = formDataValues.startTime.split(':');
                    startDateObj.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                } else {
                    startDateObj.setHours(0, 0, 0, 0);
                }

                let endDateObj = formDataValues.endDate ? new Date(formDataValues.endDate) : null;
                if (endDateObj) {
                    if (formDataValues.endTime) {
                        const [h, m] = formDataValues.endTime.split(':');
                        endDateObj.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                    } else {
                        endDateObj.setHours(0, 0, 0, 0);
                    }
                }

                const mergedData = {
                    ...formDataValues,
                    startDate: startDateObj.toISOString(),
                    endDate: endDateObj ? endDateObj.toISOString() : null,
                };

                delete (mergedData as any).startTime;
                delete (mergedData as any).endTime;
                delete (mergedData as any).eventDate;

                const fieldsToSend: any = {};
                if (isEdit) {
                    // For edits, only send fields that are marked as dirty, but extract their ACTUAL values from mergedData
                    for (const key in dirty) {
                        fieldsToSend[key] = (mergedData as any)[key];
                    }
                    
                    // If the date or time inputs were modified, we must send the re-computed unified date strings
                    if (dirty.startDate || dirty.startTime) {
                        fieldsToSend.startDate = startDateObj.toISOString();
                    }
                    if (dirty.endDate || dirty.endTime) {
                        fieldsToSend.endDate = endDateObj ? endDateObj.toISOString() : null;
                    }
                } else {
                    Object.assign(fieldsToSend, mergedData);
                }

                for (const key in fieldsToSend) {
                    const val = (fieldsToSend as any)[key];
                    if (val === undefined) continue;

                    if (val instanceof Blob) {
                        fd.append(key, val);
                    } else if (val instanceof FileList && val.length) {
                        fd.append(key, val[0]);
                    } else if (Array.isArray(val)) {
                        val.forEach(item => fd.append(key, item));
                    } else {
                        fd.append(key, val === null ? "" : String(val));
                    }
                }

                return fd;
            }}
            addEndpoint="/events"
            editEndpoint={(id) => `/events/${id}`}
            invalidateQueries={["eventsData"]}
            open={open}
            onOpenChange={onOpenChange}
            onSuccess={(res) => {
                // Intercept to show conflict warning if backend detects overlap
                if (res?.data?.warning) {
                    toast(res.data.warning, {
                        icon: '⚠️',
                        style: { background: '#f59e0b', color: '#fff', border: 'none' }
                    });
                }
                onSuccess?.();
            }}
        >
            {({ register, control, watch, setValue, formState: { errors } }) => {
                const isRecurring = watch("isRecurring");
                const { AvatarUploadCropperContent } = useAvatarUploadHandler(setValue, control);

                return (
                    <div className="grid gap-6 px-4">

                        {/* Cover Image Upload */}
                        <div className="grid gap-2">
                            <Label>Cover Image <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                            <AvatarUploadCropperContent fieldName="coverImage" aspect={16 / 9} circularCrop={false} />
                            <AvatarUploadButton
                                isRequired={false}
                                setValue={setValue}
                                getValues={() => ({})}
                                control={control}
                                name="coverImage"
                                label="Upload Cover Image"
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="eventName">Event Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="eventName"
                                {...register("eventName", { required: "Title is required" })}
                            />
                            {errors.eventName && (
                                <div className="text-red-500 text-sm">{errors.eventName.message}</div>
                            )}
                        </div>

                        {/* Recurrence Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="isRecurring"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="isRecurring"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="isRecurring">Recurring Event?</Label>
                        </div>

                        {isRecurring ? (
                            <>
                                <div className="grid gap-3">
                                    <Label htmlFor="recurrenceType">Frequency</Label>
                                    <Controller
                                        name="recurrenceType"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={true}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="recurrenceDay">Day of Week</Label>
                                    <Controller
                                        name="recurrenceDay"
                                        control={control}
                                        rules={{ required: isRecurring ? "Day is required" : false }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.recurrenceDay && (
                                        <div className="text-red-500 text-sm">{errors.recurrenceDay.message}</div>
                                    )}
                                </div>
                            </>
                        ) : null}


                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    rules={{ required: "Date is required" }}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            className='w-full'
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                        />
                                    )}
                                />
                                {errors.startDate && (
                                    <div className="text-red-500 text-sm">{(errors.startDate as any).message}</div>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="endDate">End Date <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            className='w-full'
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {isRecurring && (
                            <div className="grid gap-3">
                                <Label htmlFor="recurrenceEndDate">End Date (Optional)</Label>
                                <Controller
                                    name="recurrenceEndDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            className='w-full'
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="startTime">Start Time <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input
                                    type="time"
                                    id="startTime"
                                    {...register("startTime")}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="endTime">End Time <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input
                                    type="time"
                                    id="endTime"
                                    {...register("endTime")}
                                />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="eventLocation">Location <span className="text-red-500">*</span></Label>
                            <Input
                                id="eventLocation"
                                {...register("eventLocation", { required: "Location is required" })}
                            />
                            {errors.eventLocation && (
                                <div className="text-red-500 text-sm">{errors.eventLocation.message}</div>
                            )}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="organizer">Organizer</Label>
                            <Input
                                id="organizer"
                                {...register("organizer")}
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="registrationFee">Registration Fee <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                            <Input
                                id="registrationFee"
                                placeholder="e.g. ₹100 per person, Children free"
                                {...register("registrationFee")}
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label>Invite Groups <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                            <div className="grid grid-cols-2 gap-2 border border-border p-3 rounded-md max-h-40 overflow-y-auto">
                                {groups?.map((group: any) => (
                                    <div key={group._id} className="flex items-center space-x-2">
                                        <Controller
                                            name="invitedGroups"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id={`group-${group._id}`}
                                                    checked={field.value?.includes(group._id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        field.onChange(checked 
                                                            ? [...current, group._id] 
                                                            : current.filter((id: string) => id !== group._id)
                                                        );
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label htmlFor={`group-${group._id}`} className="text-sm font-normal cursor-pointer">
                                            {group.name}
                                        </Label>
                                    </div>
                                ))}
                                {(!groups || groups.length === 0) && (
                                    <div className="text-sm text-muted-foreground col-span-2">No groups available.</div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="description">Description <span className="text-muted-foreground text-xs">(Supports line breaks)</span></Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                rows={5}
                                placeholder="Payment instructions, event details, etc."
                            />
                        </div>
                    </div>
                )
            }}
        </CrudSheet>
    );
};