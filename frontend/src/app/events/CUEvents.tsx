import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { SquarePen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TEventsData } from "./types/events.types";
import React, { type ReactNode } from "react";



// Optional: pass event data when editing
type AddEventsProps = {
    event?: TEventsData | null;
    triggerVariant?: "default" | "outline" | "ghost";
    trigger?: ReactNode; // Allow override
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
};

export const CUEvents = ({
    event,
    triggerVariant,
    trigger,
    open,
    onOpenChange,
    onSuccess: externalOnSuccess
}: AddEventsProps) => {
    const isEdit = !!event?.id;
    console.log(event, 'event')

    return (
        <CrudSheet<TEventsData>
            id={event?.id}
            title={isEdit ? "Edit Event" : "Add Event"}
            description={isEdit ? "Update event details" : "Create a new event"}
            trigger={isEdit ? "Add Events" : isEdit}
            triggerVariant={triggerVariant}
            defaultValues={{
                eventName: event?.eventName ?? "",
                description: event?.description ?? "",
                eventDate: event?.eventDate ?? "",
                eventLocation: event?.eventLocation ?? "",
                organizer: event?.organizer ?? ""
            }}
            addEndpoint="/events"
            editEndpoint={(id) => `/events/${id}`}
            invalidateQueries={["eventsData"]}
            open={open} // ← controlled
            onOpenChange={onOpenChange} // ← controlled
            onSuccess={() => {
                externalOnSuccess?.();
            }}
        >
            {({ register, control, formState: { errors } }) => (
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="grid gap-3">
                        <Label htmlFor="eventName">Event Title</Label>
                        <Input
                            id="eventName"
                            {...register("eventName", { required: "Title is required" })}
                        />
                        {errors.eventName && (
                            <p className="text-red-500 text-xs">{errors.eventName.message}</p>
                        )}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="eventDate">Date</Label>
                        <Input
                            id="eventDate"
                            type="date"
                            {...register("eventDate", { required: "Date is required" })}
                        />
                        {errors.eventDate && (
                            <p className="text-red-500 text-xs">{errors.eventDate.message}</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                            id="eventLocation"
                            {...register("eventLocation", { required: "Location is required" })}
                        />
                        {errors.eventLocation && (
                            <p className="text-red-500 text-xs">{errors.eventLocation.message}</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="organizer">Organizer</Label>
                        <Input
                            id="organizer"
                            {...register("organizer")}
                        />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
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