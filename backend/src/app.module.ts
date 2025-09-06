import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule } from '@nestjs/config';
import { TwillioModule } from './otp/twillio/twillio.module';
import { OtpAuthModule } from './otp/otp-auth/otp-auth.module';
import { EmailModule } from './otp/email/email.module';
import { JwtHelperModule } from './crypt/jwt-helper/jwt-helper.module';
import { ChurchesModule } from './churches/churches.module';
import { MembersModule } from './members/members.module';


@Module({ 
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/hello'),
    UsersModule,
    AuthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true 
    }),
    TwillioModule,
    OtpAuthModule,
    EmailModule,
    JwtHelperModule,
    ChurchesModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 
