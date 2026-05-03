import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class FormFieldDto {
  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsEnum(['text', 'email', 'tel', 'number', 'select', 'checkbox', 'textarea'])
  type: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  options?: string[];
}
