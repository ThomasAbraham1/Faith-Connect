import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Church {
  @Prop({ required: true, unique: true, lowercase:true})
  churchName: string;
  @Prop({ required: true })
  phone: string;
  @Prop({ required: true })
  email: string;
}
export type ChurchDocument = HydratedDocument<Church>;
export const ChurchSchema = SchemaFactory.createForClass(Church);
