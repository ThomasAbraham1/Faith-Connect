import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { FormField, FormFieldSchema } from "./FormField.schema";

@Schema({ timestamps: true })
export class Events {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
    churchId: string;

    @Prop({ type: String, required: true })
    eventName: string
    @Prop({ type: Date, default: Date.now })
    eventDate: Date
    @Prop({ type: String })
    eventLocation: string
    @Prop({ type: String })
    description: string
    @Prop({ type: String })
    organizer: string

    @Prop({ type: Boolean, default: false })
    isRecurring: boolean

    @Prop({ type: String, enum: ['WEEKLY'], required: false })
    recurrenceType: string

    @Prop({ type: String, required: false })
    recurrenceDay: string

    @Prop({ type: Date, required: false })
    recurrenceEndDate: Date

    @Prop({ type: String, required: false })
    coverImageUrl?: string;

    @Prop({ type: String, required: false })
    registrationFee?: string;

    @Prop({ type: Boolean, default: true })
    registrationOpen: boolean;

    @Prop({ type: [FormFieldSchema], default: [] })
    formFields: FormField[];
}

export const EventsSchema = SchemaFactory.createForClass(Events)