import { Module } from '@nestjs/common';
import { TwillioService } from './twillio.service';
import { TwilioModule } from 'nestjs-twilio';
import { DatabaseModule } from 'src/database/database.module';
import { OtpAuthModule } from '../otp-auth/otp-auth.module';

@Module({
  imports:[
    TwilioModule.forRoot({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        }),
        DatabaseModule,
        OtpAuthModule,

  ],
  providers: [TwillioService],
  exports: [TwillioService]
})
export class TwillioModule {}
