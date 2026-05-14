import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ChurchPaymentConfigDocument = HydratedDocument<ChurchPaymentConfig>;

@Schema({ timestamps: true })
export class ChurchPaymentConfig {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true, unique: true })
  churchId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: ['RAZORPAY', 'NONE'], default: 'NONE' })
  provider: string;

  @Prop({ type: String })
  razorpayKeyId: string;

  @Prop({ type: String })
  razorpayKeySecret: string; // This will hold the ENCRYPTED value

  @Prop({ type: Boolean, default: false })
  isActive: boolean;
}

export const ChurchPaymentConfigSchema = SchemaFactory.createForClass(ChurchPaymentConfig);
