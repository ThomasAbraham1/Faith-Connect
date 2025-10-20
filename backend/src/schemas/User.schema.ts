import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { ProfilePic } from './ProfilePic.schema';
import { Church, ChurchDocument, ChurchSchema } from './Church.schema';
import { Signature, SignatureSchema } from './Signature.schema';
import { ConflictException } from '@nestjs/common';

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
  motherName: string;
  @Prop({})
  lastName: string;
  @Prop({})
  address: string;
  @Prop({})
  fatherName: string;
  @Prop({})
  firstName: string;
  @Prop({})
  phone: string;
  @Prop({ enum: Object.values(SpiritualStatus) })
  spiritualStatus: SpiritualStatus;
  @Prop({})
  dateOfBirth: string;
  @Prop({ ref: 'Role' })
  roles: string[];
  @Prop({ type: ProfilePic })
  profilePic: ProfilePic;
  @Prop({ type: Signature })
  signature: Signature;
}
export const userSchema = SchemaFactory.createForClass(User);


userSchema.path('roles').validate({
  validator: async function (value: string) {
    const UserModel = this.constructor as mongoose.Model<UserDocument>;
    if (value.includes('pastor')) {
      const user = await UserModel.findOne({
        roles: {
          $in: ['pastor']
        }
      });
      console.log(user)
      if (user) {
        return false
      }
    }
    return true;
  }, message: 'There can be only one pastor in a church. Choose associate pastor perhaps?',
})

userSchema.pre('findOneAndUpdate', async function (next) {
  console.log("inside pre findoutAnd Update")
  const user = this
  const updatedValues: any = user.getUpdate();
  console.log(updatedValues)

  if (updatedValues?.roles) {
    console.log("JLKJALSDJLKAJSLASJ")
    const query = this.getQuery()
    const docToUpdate = await this.model.findOne(query);
    const originalRolesValue = docToUpdate.roles[0]
    console.log('New role value: ', updatedValues?.roles)

    // // only 1 pastor allowed check - when pastor is going to be the updated role value
    if (updatedValues?.roles == 'pastor') {
      const count = await this.model.countDocuments({
        roles: {
          $in: ['pastor']
        }
      });
      if (count > 0) {
        throw new ConflictException(`There's already an user with Pastor role`)
      }
    }

    // Remove signature field if pastor is being made some other role
    if (originalRolesValue == 'pastor') {
      if (!updatedValues.$unset) {
        updatedValues.$unset = {};
      }
      updatedValues.$unset = {}
      updatedValues.$unset.signature = 1
      console.log(updatedValues)
      user.setUpdate(updatedValues)
      console.log("CHANGING FROM PSATORBLODDY YOU BLODDY")
      next()

    }
    console.log('Old role value: ', docToUpdate.roles[0])
  }
  next()

})

// userSchema.path('roles').validate({
//   validator: async function (value: string) {
//     console.log('ALHAMDALDLAJ')
//     const ChurchModel = mongoose.model('Church', ChurchSchema);
//     const result = await ChurchModel.find({});
//     console.log(result)
//     return false;
//   },
//   message: 'There can be only one pastor in a church.\nChoose associate pastor perhaps?',
// })