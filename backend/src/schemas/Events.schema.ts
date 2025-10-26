import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { timestamp } from "rxjs";




@Schema({  timestamps: true})
export class Events {
    // @Prop({ required: true })
    // date: string
    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
    // churchId: string
    // @Prop({ type: [{ memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: AttendanceStatus } }] })
    // records: string;
    @Prop({type: String,required: true})
    eventName: string
    @Prop({type: Date,default: Date.now})
    eventDate: Date
    @Prop({type: String})
    eventLocation: string
    @Prop({type: String})
    description: string
    @Prop({type: String})
    organizer: string
}

export const EventsSchema = SchemaFactory.createForClass(Events)