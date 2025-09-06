import { Types } from 'mongoose';

interface Role {
  name: string;
  permissions: Permission[];
}

interface Permission {
  name: string;
}
export class CreateMemberDto {
  userName: string;
  password: string;
  churchId: Types.ObjectId;
  roles: Role[];
}
