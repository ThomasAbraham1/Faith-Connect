import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false }) // No need for separate ObjectIds for each field
export class FormField {
  @Prop({ required: true })
  name: string; // The internal key (e.g., 'dietary_requirements')

  @Prop({ required: true })
  label: string; // The display name (e.g., 'Dietary Requirements')

  @Prop({ required: true, enum: ['text', 'email', 'tel', 'number', 'select', 'checkbox', 'textarea'] })
  type: string;

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: [String], default: [] })
  options: string[]; // Only used if type is 'select'
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);
