import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, userSchema } from 'src/schemas/User.schema';
import { BulkEmailController } from './bulk-email.controller';
import { BulkEmailService } from './bulk-email.service';
import { QueueService } from './queue.service';
import { MailerService } from './mailer.service';
import { Resend } from 'resend';
import { Batch, BatchSchema } from 'src/schemas/Batch.schema';
import { EmailLog, EmailLogSchema } from 'src/schemas/EmailLog.schema';

/**
 * BulkEmailModule groups everything related to bulk email into one NestJS module.
 *
 * Think of a Module as a "package" — it declares what belongs together
 * and what dependencies each piece needs.
 *
 * Providers = things this module creates and can inject into each other:
 *   BulkEmailService → needs User model + QueueService
 *   QueueService     → needs ConfigService (from ConfigModule) + MailerService
 *   MailerService    → needs ConfigService
 *
 * The User model is registered via MongooseModule so BulkEmailService
 * can query the users collection in MongoDB.
 */
@Module({
  imports: [
    ConfigModule,
    // Register the User model so we can use @InjectModel(User.name) in BulkEmailService
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
    MongooseModule.forFeature([{ name: EmailLog.name, schema: EmailLogSchema }]),
  ],
  controllers: [BulkEmailController],
  providers: [BulkEmailService, QueueService, MailerService, {
    provide: 'RESEND',
    useFactory: (configService: ConfigService) => new Resend(configService.get<string>('RESEND_API_KEY')),
    inject: [ConfigService]
  }],
  exports: [QueueService, MailerService], // Added so RemindersModule can push jobs to the Queue
})
export class BulkEmailModule { }
