import { IsNotEmpty } from 'class-validator';

interface Role {
  name: string;
  permission: Permission[];
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

  email: string;
  roles: Role[];
}
