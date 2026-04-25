import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Church } from './Church.schema';
import { User } from './User.schema';

export type GroupDocument = HydratedDocument<Group>;

@Schema({ timestamps: true })
export class Group {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
  churchId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['REGION', 'MINISTRY'] })
  category: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  leaders: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: mongoose.Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  allocatedBudget: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
