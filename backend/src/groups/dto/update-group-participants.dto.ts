import { IsArray, IsOptional } from 'class-validator';

export class UpdateGroupParticipantsDto {
  @IsArray()
  @IsOptional()
  addMembers?: string[];

  @IsArray()
  @IsOptional()
  removeMembers?: string[];

  @IsArray()
  @IsOptional()
  addLeaders?: string[];

  @IsArray()
  @IsOptional()
  removeLeaders?: string[];
}
