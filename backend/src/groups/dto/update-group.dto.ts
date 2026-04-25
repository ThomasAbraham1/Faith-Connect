import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['REGION', 'MINISTRY'])
  @IsOptional()
  category?: string;

  @IsOptional()
  allocatedBudget?: number;
}
