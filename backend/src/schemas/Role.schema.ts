import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from './Permission.schema'; // Assuming permission.schema.ts exists

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string; // e.g., 'Admin', 'Editor', 'Viewer'

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[]; // Array of references to Permission documents
}

export const RoleSchema = SchemaFactory.createForClass(Role);