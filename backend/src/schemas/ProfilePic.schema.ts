import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ProfilePic extends Document {
  @Prop({ type: String })
  profilePicName: string;

  @Prop({ type: String })
  profilePicPath: string;
}

export const ProfileSchema = SchemaFactory.createForClass(ProfilePic)
