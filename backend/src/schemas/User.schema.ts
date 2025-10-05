import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './Role.schema';
import { ProfilePic } from './ProfilePic.schema';

export enum SpiritualStatus {
  BELIEVER = 'BELIEVER',
  NON_BELIEVER = 'NON_BELIEVER',
  SEEKER = 'SEEKER',
  UNDECIDED = 'UNDECIDED',
}
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Church' })
  churchId: string;
  @Prop({ required: true, lowercase: true })
  userName: string;
  @Prop({ required: true })
  password: string;
  @Prop({})
  phone: string;
  @Prop({ enum: Object.values(SpiritualStatus) })
  spiritualStatus: SpiritualStatus;
  @Prop({})
  dateOfBirth: string;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Role' })
  roles: string[];
  @Prop({ type: ProfilePic })
  profilePic: ProfilePic;
}
export const userSchema = SchemaFactory.createForClass(User);

