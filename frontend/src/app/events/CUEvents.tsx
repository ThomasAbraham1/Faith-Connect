import { CrudSheet } from "@/components/dynamic/CrudSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TEventsData } from "./types/events.types";
import React, { type ReactNode } from "react";
import { HookFormField } from "@/components/dynamic/HookFormField";
import { HookFormBody } from "@/components/dynamic/HookFormBody";
import * as lodash from "lodash";



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
    console.log(event?.eventDate, 'event')

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
                <HookFormBody>
                    <HookFormField fieldName={'eventName'} errors={errors}>
                        <Input
                            id="eventName"
                            type="text"
                            {...register("eventName", { required: `${lodash.startCase('eventName')}` })}
                        />
                    </HookFormField>
                    <HookFormField fieldName={'eventDate'} errors={errors}>
                        <Input
                            id="eventDate"
                            type="date"
                            {...register("eventDate", { required: `${lodash.startCase('eventDate')}` })}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Input
                            id="eventLocation"
                            {...register("eventLocation", { required: `${lodash.startCase('eventLocation')}` })}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                            id="eventLocation"
                            {...register("eventLocation", { required: `${lodash.startCase('eventDate')}` })}
                        />
                        {errors.eventLocation && (
                            <p className="text-red-500 text-xs">{errors.eventLocation.message}</p>
                        )}
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="organizer">Organizer</Label>
                        <Input
                            id="organizer"
                            {...register("organizer")}
                        />
                    </HookFormField>
                    <HookFormField errors={errors} fieldName={'eventLocation'}>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            rows={4}
                        />
                    </HookFormField>

                </HookFormBody>
            )}
        </CrudSheet>
    );
};