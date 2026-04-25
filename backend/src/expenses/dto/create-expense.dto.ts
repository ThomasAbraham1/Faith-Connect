import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @IsNotEmpty()
  amount: number | string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
