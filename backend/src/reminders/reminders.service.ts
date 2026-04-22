import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { QueueService } from 'src/bulk-email/queue.service';

/**
 * RemindersService runs background cron jobs automatically.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly queueService: QueueService, // Injected from BulkEmailModule
  ) {}

  /**
   * This Cron job runs every day at 8:00 AM.
   * You can test it by changing the expression to CronExpression.EVERY_10_SECONDS
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkBirthdaysAndAnniversaries() {
    this.logger.log('Starting daily birthday and anniversary check...');
    
    // Get today's month and day in "-MM-DD" format (e.g., "-04-22")
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateSuffix = `-${month}-${day}`;

    // 1. Check for Birthdays
    const birthdayUsers = await this.userModel.find({
      // We look for a string ending in "-MM-DD" using regex
      dateOfBirth: { $regex: new RegExp(`${dateSuffix}$`) },
      email: { $exists: true, $ne: '' } // Only users with emails
    });

    for (const user of birthdayUsers) {
      if (!user.email) continue;
      
      const firstName = user.firstName || user.userName;
      
      // Push job to SQS queue
      await this.queueService.enqueue({
        to: user.email,
        subject: `🎉 Happy Birthday, ${firstName}!`,
        body: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Happy Birthday, ${firstName}! 🎂</h2>
            <p>We are praying for you and wishing you a blessed year ahead from everyone at the church.</p>
          </div>
        `,
      });
      this.logger.log(`Queued birthday email for ${user.email}`);
    }

    // 2. Check for Anniversaries
    const anniversaryUsers = await this.userModel.find({
      anniversaryDate: { $regex: new RegExp(`${dateSuffix}$`) },
      email: { $exists: true, $ne: '' }
    });

    for (const user of anniversaryUsers) {
      if (!user.email) continue;
      
      const firstName = user.firstName || user.userName;
      
      // Push job to SQS queue
      await this.queueService.enqueue({
        to: user.email,
        subject: `💍 Happy Anniversary, ${firstName}!`,
        body: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Happy Anniversary, ${firstName}! 🎉</h2>
            <p>May God continue to bless your marriage with love, joy, and peace.</p>
          </div>
        `,
      });
      this.logger.log(`Queued anniversary email for ${user.email}`);
    }

    this.logger.log('Finished daily reminder checks.');
  }

  // --- Utility for testing without waiting for 8 AM ---
  // Uncomment the decorator below to run immediately when server starts (for testing only)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async _testRunNow() {
    this.logger.log('[TEST] Force-running reminder check for right now...');
    await this.checkBirthdaysAndAnniversaries();
  }
}
