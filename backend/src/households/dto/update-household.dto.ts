import { IsOptional, IsMongoId, IsArray, IsString } from 'class-validator';

export class UpdateHouseholdMembersDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  addMembers?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  removeMembers?: string[];

  @IsMongoId()
  @IsOptional()
  primaryContactId?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
