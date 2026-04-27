import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
  churchId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true })
  eventId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  memberId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: ['PUBLIC_FORM', 'ADMIN_ADDED'], default: 'PUBLIC_FORM' })
  source: string;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Prevent duplicate registrations for the same person + event
RegistrationSchema.index({ eventId: 1, memberId: 1 }, { unique: true });
