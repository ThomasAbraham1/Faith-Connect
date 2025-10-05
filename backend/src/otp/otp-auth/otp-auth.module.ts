import { Module } from '@nestjs/common';
import { OtpAuthService } from './otp-auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtHelperModule } from 'src/crypt/jwt-helper/jwt-helper.module';

@Module({
  imports: [DatabaseModule, JwtHelperModule],
  providers: [OtpAuthService],
  exports: [OtpAuthService]
})
export class OtpAuthModule {}
