import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true })
  churchId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  groupId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  submittedBy: mongoose.Types.ObjectId;

  @Prop()
  receiptUrl: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
