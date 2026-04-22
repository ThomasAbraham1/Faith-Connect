import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true })
export class Template {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Church' })
    churchId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    createdBy: mongoose.Types.ObjectId;

    @Prop({ required: true })
    name: string; // Internal name for the template

    @Prop({ required: true })
    subject: string; // The email subject line

    @Prop({ required: true })
    body: string; // The HTML body content (from Jodit)
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
