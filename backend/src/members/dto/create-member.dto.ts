import { Types } from 'mongoose';
import { Signature } from './../../schemas/Signature.schema';
import { SignatureDto } from './signature.dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

// interface Role {
//   name: string;
//   permissions: Permission[];
// }

export enum Role {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  STAFF = 'staff',
  MEMBER = 'member',
}


export enum SpiritualStatus {
  BELIEVER = 'BELIEVER',
  NON_BELIEVER = 'NON_BELIEVER',
  SEEKER = 'SEEKER',
  UNDECIDED = 'UNDECIDED',
}
interface Permission {
  name: string;
}

interface profilePic {
  profilePicName: string;
  profilePicPath: string; 
}

export class CreateMemberDto {
  userName: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  email: string;
  @IsString()
  phone: string;
  @IsString()
  password: string;
  @IsString()
  fatherName: string;
  @IsString()
  motherName: string;
  @IsString()
  address: string;
  churchId: Types.ObjectId;
  @IsEnum(Role, { each: true })
  roles: Role[];
  spiritualStatus: SpiritualStatus
  profilePic: profilePic;
  signature: SignatureDto;

  @IsOptional()
  @IsString()
  householdRole?: string;

  @IsOptional()
  @IsString()
  householdId?: string;
}
