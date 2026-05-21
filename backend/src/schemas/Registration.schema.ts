import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
  churchId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true })
  eventId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  memberId?: mongoose.Types.ObjectId;

  @Prop({ type: Map, of: mongoose.Schema.Types.Mixed, default: {} })
  responses: Map<string, any>;

  @Prop({ type: String, enum: ['PUBLIC_FORM', 'ADMIN_ADDED'], default: 'PUBLIC_FORM' })
  source: string;

  @Prop({ type: String, enum: ['FREE', 'PENDING', 'PAID', 'FAILED'], default: 'FREE' })
  paymentStatus: string;

  @Prop({ type: String, required: false })
  razorpayOrderId?: string;

  @Prop({ type: String, required: false })
  razorpayPaymentId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Index for performance
RegistrationSchema.index({ eventId: 1 });
