import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './Role.schema';


export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ unique: true, required: true, lowercase: true })
  churchName: string;
  @Prop({ required: true })
  userName: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  phone: string;
  @Prop()
  email: string;
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }] })
  roles: Role[]; // Array of references to Role documents
}
export const userSchema = SchemaFactory.createForClass(User);
