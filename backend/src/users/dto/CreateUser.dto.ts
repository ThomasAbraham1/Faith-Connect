import { Type } from 'class-transformer';
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
interface Role {
  name: string;
  permissions: Permission[];
}

interface Permission {
  name: string;
}
export class CreateUserDto{
  userName: string;
  password: string;
  churchId: Types.ObjectId;
  roles: string[]; 
};
