import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwillioModule } from './otp/twillio/twillio.module';
import { OtpAuthModule } from './otp/otp-auth/otp-auth.module';
import { EmailModule } from './otp/email/email.module';
import { JwtHelperModule } from './crypt/jwt-helper/jwt-helper.module';
import { ChurchesModule } from './churches/churches.module';
import { MembersModule } from './members/members.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AttendanceModule } from './attendance/attendance.module'; 
import { SettingsModule } from './settings/settings.module';
import { EventsModule } from './events/events.module';
import { BulkEmailModule } from './bulk-email/bulk-email.module';
import { RemindersModule } from './reminders/reminders.module';
import { TemplatesModule } from './templates/templates.module';
import { GroupsModule } from './groups/groups.module';
import { ExpensesModule } from './expenses/expenses.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { HouseholdsModule } from './households/households.module';

import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TwilioModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_ACCOUNT_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('Connecting to MongoDB with URI:', configService.get<string>('MONGO_DB_URI'), process.env.NODE_ENV);
        const uri = configService.get<string>('MONGO_DB_URI');
        if (!uri) throw new Error('MONGO_DB_URI is not defined');
        return { uri }; 
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TwillioModule,
    OtpAuthModule,
    EmailModule,
    JwtHelperModule,
    ChurchesModule,
    MembersModule,
    AttendanceModule,
    SettingsModule,
    EventsModule,
    BulkEmailModule,
    RemindersModule,
    TemplatesModule,
    DashboardModule,
    GroupsModule,
    ExpensesModule,
    WhatsappModule,
    HouseholdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
