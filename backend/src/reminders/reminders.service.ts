import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { QueueService } from 'src/bulk-email/queue.service';
import { EmailLog, EmailLogDocument, EmailLogType } from 'src/schemas/EmailLog.schema';

/**
 * RemindersService runs background cron jobs automatically.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(EmailLog.name) private emailLogModel: Model<EmailLogDocument>,
    private readonly queueService: QueueService, // Injected from BulkEmailModule
  ) {}

  /**
   * This Cron job runs every day at 8:00 AM.
   */
  @Cron('58 1 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async checkBirthdaysAndAnniversaries() {
    this.logger.log('Starting daily birthday and anniversary check...');
    
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateSuffix = `-${month}-${day}`;

    // Calculate start of today for deduplication check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Check for Birthdays
    const birthdayUsers = await this.userModel.find({
      dateOfBirth: { $regex: new RegExp(`${dateSuffix}$`) },
      email: { $exists: true, $ne: '' }
    });

    for (const user of birthdayUsers) {
      if (!user.email) continue;
      
      // Deduplication check: Has this user already been sent a birthday email today?
      const existingLog = await this.emailLogModel.findOne({
        recipientId: user._id,
        type: EmailLogType.BIRTHDAY,
        createdAt: { $gte: startOfToday }
      });

      if (existingLog) {
        this.logger.log(`Skipping birthday email for ${user.email} — already sent today.`);
        continue;
      }

      const firstName = user.firstName || user.userName;
      const subject = `🎉 Happy Birthday, ${firstName}!`;
      const body = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Happy Birthday, ${firstName}! 🎂</h2>
          <p>We are praying for you and wishing you a blessed year ahead from everyone at the church.</p>
        </div>
      `;
      
      await this.queueService.enqueue({
        to: user.email,
        churchId: user.churchId,
        batchId: null, // Not part of a bulk batch
        subject,
        body,
      });

      // Audit Log
      await this.emailLogModel.create({
        churchId: user.churchId,
        recipientId: user._id,
        recipientEmail: user.email,
        subject,
        type: EmailLogType.BIRTHDAY,
        status: 'SENT'
      });

      this.logger.log(`Queued birthday email for ${user.email} and logged.`);
    }

    // 2. Check for Anniversaries
    const anniversaryUsers = await this.userModel.find({
      anniversaryDate: { $regex: new RegExp(`${dateSuffix}$`) },
      email: { $exists: true, $ne: '' }
    });

    for (const user of anniversaryUsers) {
      if (!user.email) continue;

      // Deduplication check
      const existingLog = await this.emailLogModel.findOne({
        recipientId: user._id,
        type: EmailLogType.ANNIVERSARY,
        createdAt: { $gte: startOfToday }
      });

      if (existingLog) {
        this.logger.log(`Skipping anniversary email for ${user.email} — already sent today.`);
        continue;
      }
      
      const firstName = user.firstName || user.userName;
      const subject = `💍 Happy Anniversary, ${firstName}!`;
      const body = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Happy Anniversary, ${firstName}! 🎉</h2>
          <p>May God continue to bless your marriage with love, joy, and peace.</p>
        </div>
      `;
      
      await this.queueService.enqueue({
        to: user.email,
        subject,
        body,
      });

      // Audit Log
      await this.emailLogModel.create({
        churchId: user.churchId,
        recipientId: user._id,
        recipientEmail: user.email,
        subject,
        type: EmailLogType.ANNIVERSARY,
        status: 'SENT'
      });

      this.logger.log(`Queued anniversary email for ${user.email} and logged.`);
    }

    this.logger.log('Finished daily reminder checks.');
  }

  /**
   * Returns statistics for today's special days for a specific church.
   */
  async getTodayStats(churchId: string) {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateSuffix = `-${month}-${day}`;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Count Birthdays
    const birthdaysCount = await this.userModel.countDocuments({
      churchId,
      dateOfBirth: { $regex: new RegExp(`${dateSuffix}$`) },
    });

    // Count Anniversaries
    const anniversariesCount = await this.userModel.countDocuments({
      churchId,
      anniversaryDate: { $regex: new RegExp(`${dateSuffix}$`) },
    });

    // Count Sent Emails
    const sentEmailsCount = await this.emailLogModel.countDocuments({
      churchId,
      createdAt: { $gte: startOfToday },
      status: 'SENT',
    });

    return {
      birthdays: birthdaysCount,
      anniversaries: anniversariesCount,
      emailsSent: sentEmailsCount,
    };
  }

  // --- Utility for testing without waiting for 8 AM ---
  // Uncomment the decorator below to run immediately when server starts (for testing only)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async _testRunNow() {
    this.logger.log('[TEST] Force-running reminder check for right now...');
    await this.checkBirthdaysAndAnniversaries();
  }
}
