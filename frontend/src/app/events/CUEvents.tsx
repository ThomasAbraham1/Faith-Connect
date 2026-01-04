import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TEventsData } from "./types/events.types";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@/components/date-picker";

// Optional: pass event data when editing
type AddEventsProps = {
    data?: TEventsData | null; // Renamed from event
    triggerVariant?: "default" | "outline" | "ghost";
    trigger?: string; // Aligning type to string like CUMembers
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
};

export const CUEvents = ({
    data, // Renamed from event
    triggerVariant,
    trigger,
    open,
    onOpenChange,
    onSuccess
}: AddEventsProps) => {
    const isEdit = !!data?.id;

    return (
        <CrudSheet<TEventsData>
            id={data?.id}
            title={trigger!}
            description={isEdit ? "Update event details" : "Create a new event"}
            trigger={trigger!}
            triggerVariant={triggerVariant}
            defaultValues={useMemo(() => ({
                eventName: data?.eventName ?? "",
                description: data?.description ?? "",
                eventDate: data?.eventDate ?? "",
                eventLocation: data?.eventLocation ?? "",
                organizer: data?.organizer ?? ""
            }), [data])}
            addEndpoint="/events"
            editEndpoint={(id) => `/events/${id}`}
            invalidateQueries={["eventsData"]}
            open={open}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
        >
            {({ register, control, formState: { errors } }) => (
                <div className="grid gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="eventName">Event Title</Label>
                        <Input
                            id="eventName"
                            {...register("eventName", { required: "Title is required" })}
                        />
                        {errors.eventName && (
                            <div className="text-red-500 text-sm">{errors.eventName.message}</div>
                        )}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="eventDate">Date</Label>
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

                    <div className="grid gap-3">
                        <Label htmlFor="eventLocation">Location</Label>
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
            )}
        </CrudSheet>
    );
};