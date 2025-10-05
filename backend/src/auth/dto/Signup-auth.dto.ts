import { IsNotEmpty } from 'class-validator';
import mongoose, { ObjectId, Types } from 'mongoose';

// interface Role {
//   _id: Types.ObjectId;
//   name: string;
// }

interface Permission {
  name: string;
}
export class SignupDto {
  @IsNotEmpty()
  churchName: string;
  @IsNotEmpty()
  userName: string;
  @IsNotEmpty()
  password: string;
  phone: string;
  churchId: Types.ObjectId;
  email: string;
  roles: string[];
}
