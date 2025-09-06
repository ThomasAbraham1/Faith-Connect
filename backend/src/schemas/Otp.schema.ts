import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './User.schema';

@Schema()
export class Otp extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string;
  @Prop()
  secret: string;
  @Prop({
    type: Date,
    default: Date.now,
    expires: '5m',
  })
  createdAt: Date;
}

export const otpSchema = SchemaFactory.createForClass(Otp)
