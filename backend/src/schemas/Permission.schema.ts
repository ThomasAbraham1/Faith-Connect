import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Permission extends Document {
  @Prop()
  resource: string; // e.g., 'users', 'products', 'articles'

  @Prop()
  action: string; // e.g., 'read', 'write', 'delete'

  @Prop({ unique: true })
  name: string; // e.g., 'users:read', 'products:write' (for easier lookup)
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);