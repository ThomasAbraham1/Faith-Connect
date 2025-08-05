import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop({ required: true })
  resource: string; // e.g., 'users', 'products', 'articles'

  @Prop({ required: true })
  action: string; // e.g., 'read', 'write', 'delete'

  @Prop({ unique: true })
  name: string; // e.g., 'users:read', 'products:write' (for easier lookup)
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);