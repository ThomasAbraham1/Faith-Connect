import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import * as  beautifyUnique from 'mongoose-beautiful-unique-validation';
import { Role } from './Role.schema';

@Schema({ timestamps: true })
export class Church {
  @Prop({ required: true, unique: true, lowercase: true })
  churchName: string;
  @Prop({ required: true })
  phone: string;
  @Prop({ required: true })
  email: string;
  // @Prop({ default: ['admiasdan', 'pastoasdr'] })
  // roles: Role[];
  @Prop({ type: [Role], default: [{ name: 'admin', permissions: [] }, { name: 'pastor', permissions: [] }, { name: 'staff', permissions: [] }, { name: 'member', permissions: [] }] })
  roles: Role[];
}
export type ChurchDocument = HydratedDocument<Church>;
export const ChurchSchema = SchemaFactory.createForClass(Church);
// ChurchSchema.plugin(beautifyUnique, {
//   defaultMessage: 'Error, expected {PATH} to be unique.',
//   messages: {
//     churchName: 'Church name "{VALUE}" is already taken',
//   },
// });

// ChurchSchema.path('churchName').validate({
//   validator: async function (value: string) {
//     // `this` = current document
//     const ChurchModel = this.constructor as mongoose.Model<ChurchDocument>;
//     const count = await ChurchModel.countDocuments({
//       churchName: value,
//       _id: { $ne: this._id }, // exclude current doc when updating
//     });
//     return count === 0;
//   },
//   message: props => `${props.value} is not a valid email address!`,
//   // You can add custom properties here

// });

