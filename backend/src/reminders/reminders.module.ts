import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/schemas/User.schema';
import { BulkEmailModule } from 'src/bulk-email/bulk-email.module';
import { RemindersService } from './reminders.service';
import { EmailLog, EmailLogSchema } from 'src/schemas/EmailLog.schema';

import { RemindersController } from './reminders.controller';

/**
 * RemindersModule encapsulates all logic for automated birthday/anniversary reminders.
 * 
 * It imports the BulkEmailModule to reuse the QueueService for sending the actual emails.
 */
@Module({
  imports: [
    // Register the models needed for reminders and audit logging
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
    // Import BulkEmailModule to get access to QueueService (which we exported there)
    BulkEmailModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
