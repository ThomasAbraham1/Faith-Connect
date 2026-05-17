import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';

// This class tells NestJS what body shape the POST /bulk-email/send endpoint expects.
// NestJS will automatically validate this and return a 400 error if data is wrong.
export class SendBulkEmailDto {
  // memberIds: array of MongoDB _id strings for the people to email
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  // The email subject line
  @IsString()
  @IsNotEmpty({ message: 'Subject cannot be empty.' })
  subject: string;

  // The email body — can be plain text or HTML
  @IsString()
  @IsNotEmpty({ message: 'Email body cannot be empty.' })
  body: string;
}
