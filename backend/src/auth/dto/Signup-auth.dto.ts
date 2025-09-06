import { IsNotEmpty } from 'class-validator';
import mongoose, { ObjectId, Types } from 'mongoose';

interface Role {
  name: string;
  permissions: Permission[];
}

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
  roles: Role[];
}
