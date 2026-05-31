import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { htmlContentGenerator } from './htmlContent';
import { OtpAuthModule } from '../otp-auth/otp-auth.module';
import { BulkEmailModule } from 'src/bulk-email/bulk-email.module';

@Module({
  imports: [OtpAuthModule, BulkEmailModule],
  providers: [EmailService, htmlContentGenerator],
  exports: [EmailService]
})
export class EmailModule { }
