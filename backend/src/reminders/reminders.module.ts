import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/schemas/User.schema';
import { BulkEmailModule } from 'src/bulk-email/bulk-email.module';
import { RemindersService } from './reminders.service';

/**
 * RemindersModule encapsulates all logic for automated birthday/anniversary reminders.
 * 
 * It imports the BulkEmailModule to reuse the QueueService for sending the actual emails.
 */
@Module({
  imports: [
    // Register the User model so RemindersService can query MongoDB
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    // Import BulkEmailModule to get access to QueueService (which we exported there)
    BulkEmailModule,
  ],
  providers: [RemindersService],
})
export class RemindersModule {}
