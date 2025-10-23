import { Types } from 'mongoose';
import { Signature } from './../../schemas/Signature.schema';
import { SignatureDto } from './signature.dto';
import { IsArray, IsEnum } from 'class-validator';

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
  password: string;
  churchId: Types.ObjectId;
  @IsEnum(Role, { each: true })
  roles: Role[];
  spiritualStatus: SpiritualStatus
  profilePic: profilePic;
  signature: SignatureDto
}
