import { Module } from '@nestjs/common';
import { TwillioService } from './twillio.service';
import { TwilioModule } from 'nestjs-twilio';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[
    TwilioModule.forRoot({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        }),
        DatabaseModule
  ],
  providers: [TwillioService],
  exports: [TwillioService]
})
export class TwillioModule {}
