import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";



export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
}

export class AttendanceRecordDto {
    memberId: string;
    status: AttendanceStatus;
}

@Schema()
export class Attendance {
    @Prop({ required: true })
    date: string
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
    churchId: string
    @Prop({ type: [{ memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: AttendanceStatus } }] })
    records: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)