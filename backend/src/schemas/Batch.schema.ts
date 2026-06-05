import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum BatchType {
    EVENT = 'EVENT',
    GENERAL = 'GENERAL', // For standard bulk emails sent from the main page
}

@Schema({ timestamps: true })
export class Batch {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Church' })
    churchId: string;

    @Prop({ enum: BatchType, default: BatchType.GENERAL })
    type: BatchType;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: false })
    eventId: string;

    @Prop({ required: false })
    name?: string;
}

export const BatchSchema = SchemaFactory.createForClass(Batch)


