import { Type } from 'class-transformer';
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
export class UserPermission {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  permission: string;
}
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  churchName: string;
  _id?: string;
  userName: string;
  password: string;
  @ValidateNested()
  @Type(() => UserPermission)
  roles: UserPermission;
}
