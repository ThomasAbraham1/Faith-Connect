import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './Role.schema';

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church' })
  churchId: string;
  @Prop({ unique: true, required: true, lowercase: true })
  userName: string;
  @Prop({ required: true })
  password: string;

  @Prop({ type: [mongoose.Schema.Types.String] })
  roles: Role[]; // Array of references to Role documents
}
export const userSchema = SchemaFactory.createForClass(User);
