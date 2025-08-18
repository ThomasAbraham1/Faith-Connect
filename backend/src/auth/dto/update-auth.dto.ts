import { PartialType } from '@nestjs/mapped-types';
import { SignupDto } from './Signup-auth.dto';

export class UpdateAuthDto extends PartialType(SignupDto) {}
