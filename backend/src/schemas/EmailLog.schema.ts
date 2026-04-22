import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type EmailLogDocument = HydratedDocument<EmailLog>;

export enum EmailLogType {
  BIRTHDAY = 'BIRTHDAY',
  ANNIVERSARY = 'ANNIVERSARY',
  BULK = 'BULK',
  REMINDER = 'REMINDER',
}

@Schema({ timestamps: true })
export class EmailLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
  churchId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  recipientId: string;

  @Prop({ required: true })
  recipientEmail: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, enum: EmailLogType })
  type: EmailLogType;

  @Prop({ default: 'SENT' })
  status: string;

  @Prop()
  error?: string;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
