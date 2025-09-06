import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { htmlContentGenerator } from './htmlContent';
import { OtpAuthModule } from '../otp-auth/otp-auth.module';

@Module({
  imports: [OtpAuthModule],
  providers: [EmailService, htmlContentGenerator],
  exports:[EmailService]
})
export class EmailModule {}
