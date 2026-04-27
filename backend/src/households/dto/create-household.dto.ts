import { IsOptional, IsString, IsMongoId, IsArray } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  name: string;

  @IsMongoId()
  primaryContactId: string;

  churchId: string; // set from req.user

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];
}
