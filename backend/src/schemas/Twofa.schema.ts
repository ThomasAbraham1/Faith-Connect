import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from './User.schema';

@Schema()
export class Twofa extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;
  @Prop()
  rememberDeviceToken: string;
  @Prop({
    type: Date,
    default: Date.now,
    expires: '365d',
  })
  createdAt: Date;
}
export const TwofaSchema = SchemaFactory.createForClass(Twofa);
