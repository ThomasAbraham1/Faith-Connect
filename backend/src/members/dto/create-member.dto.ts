import { Types } from 'mongoose';

// interface Role {
//   name: string;
//   permissions: Permission[];
// }

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
  roles: string[];
  spiritualStatus: SpiritualStatus
  profilePic: profilePic;
}
