import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TEventsData } from "./types/events.types";
import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
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
            defaultValues={useMemo(() => ({
                eventName: data?.eventName ?? "",
                description: data?.description ?? "",
                eventDate: data?.eventDate ?? "",
                eventLocation: data?.eventLocation ?? "",
                organizer: data?.organizer ?? "",
                isRecurring: data?.isRecurring ?? false,
                recurrenceType: data?.recurrenceType ?? 'WEEKLY',
                recurrenceDay: data?.recurrenceDay ?? "",
                recurrenceEndDate: data?.recurrenceEndDate ?? ""
            }), [data])}
            addEndpoint="/events"
            editEndpoint={(id) => `/events/${id}`}
            invalidateQueries={["eventsData"]}
            open={open}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
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


                        <div className="grid gap-3">
                            <Label htmlFor="eventDate">{isRecurring ? "Start Date" : "Date"} <span className="text-red-500">*</span></Label>
                            <Controller
                                name="eventDate"
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
                            {errors.eventDate && (
                                <div className="text-red-500 text-sm">{errors.eventDate.message}</div>
                            )}
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                rows={4}
                            />
                        </div>
                    </div>
                )
            }}
        </CrudSheet>
    );
};