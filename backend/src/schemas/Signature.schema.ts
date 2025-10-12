import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema()
export class Signature extends Document {
  @Prop({ type: String })
  signaturePicName: string;

  @Prop({ type: String })
  signaturePicPath: string;
}
export type SignatureDocument = HydratedDocument<Signature>;
export const SignatureSchema = SchemaFactory.createForClass(Signature)
