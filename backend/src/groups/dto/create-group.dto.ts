import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['REGION', 'MINISTRY'])
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsOptional()
  leaders?: string[];

  @IsArray()
  @IsOptional()
  members?: string[];

  // churchId is usually injected from the controller from req.user
  churchId?: string;
}
