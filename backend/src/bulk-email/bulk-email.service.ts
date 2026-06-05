import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { QueueService } from './queue.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { Batch } from 'src/schemas/Batch.schema';
import { EmailLog } from 'src/schemas/EmailLog.schema';

/**
 * BulkEmailService is the "brain" of this feature.
 *
 * It receives a list of member IDs + email content, looks up each member's
 * email address in the database, then pushes one job per recipient into the
 * SQS queue. The QueueService picks those up and sends the actual emails.
 */
@Injectable()
export class BulkEmailService {
  private readonly logger = new Logger(BulkEmailService.name);

  constructor(
    // Inject the User model so we can query MongoDB
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Batch.name) private readonly batchModel: Model<Batch>,
    @InjectModel(EmailLog.name) private readonly emailLogModel: Model<EmailLog>,
    // Inject QueueService so we can push email jobs
    private readonly queueService: QueueService,
  ) { }

  /**
   * Main method — called by the controller when admin hits "Send".
   *
   * Steps:
   * 1. Look up each member by their MongoDB _id
   * 2. Skip members that don't have an email address (and log it)
   * 3. Push one message into the SQS queue per valid recipient
   * 4. Return a summary of what happened
   */
  async sendBulkEmail(dto: SendBulkEmailDto, churchId: string): Promise<{
    queued: number;
    skipped: number;
    skippedNames: string[];
  }> {
    let queued = 0;
    let skipped = 0;
    const skippedNames: string[] = [];

    // 1. Create the single Batch record for this entire send
    const batch = await this.batchModel.create({
      churchId,
      name: dto.subject, // Or a custom name if you add it to the DTO
      type: dto.eventId ? 'EVENT' : 'GENERAL',
      eventId: dto.eventId || undefined,
    });

    // 2. Process memberIds (existing members with personalization)
    if (dto.memberIds && dto.memberIds.length > 0) {
      const members = await this.userModel.find({
        _id: { $in: dto.memberIds },
      });

      for (const member of members) {
        if (!member.email) {
          const name = member.firstName || member.userName || 'Unknown';
          this.logger.warn(`Skipping ${name} — no email address on file.`);
          skipped++;
          skippedNames.push(name);
          continue;
        }

        const personalizedSubject = this.replacePlaceholders(dto.subject, member);
        const personalizedBody = this.replacePlaceholders(dto.body, member);
        // Create the log in DB
        const emailLog = await this.emailLogModel.create({
          churchId,
          batchId: batch._id.toString(),
          recipientId: member._id,
          recipientEmail: member.email,
          subject: personalizedSubject,
          type: 'BULK',
          status: 'PENDING',
        });

        await this.queueService.enqueue({
          eventId: dto.eventId,
          churchId,
          emailLogId: emailLog._id.toString(),
          batchId: batch._id.toString(),
          to: member.email,
          subject: personalizedSubject,
          body: personalizedBody,
        });

        queued++;
      }
    }

    // 2. Process raw emails (registrants/guests)
    if (dto.emails && dto.emails.length > 0) {
      for (const email of dto.emails) {
        if (!email) continue;

        // Create the log in DB
        const emailLog = await this.emailLogModel.create({
          churchId,
          batchId: batch._id.toString(),
          recipientEmail: email,
          subject: dto.subject,
          type: 'BULK',
          status: 'PENDING',
        });

        // Send directly (no personalization as there's no member record)
        await this.queueService.enqueue({
          churchId,
          eventId: dto.eventId,
          emailLogId: emailLog._id.toString(),
          batchId: batch._id.toString(),
          to: email,
          subject: dto.subject,
          body: dto.body,
        });

        queued++;
      }
    }

    if (queued === 0 && skipped === 0) {
      throw new NotFoundException('No recipients found to email.');
    }

    this.logger.log(
      `Bulk email job done. Queued: ${queued}, Skipped: ${skipped}`,
    );

    return { queued, skipped, skippedNames };
  }

  /**
   * Helper to replace placeholders like {{firstName}} with actual user data.
   */
  private replacePlaceholders(content: string, user: UserDocument): string {
    if (!content) return '';

    return content
      .replace(/{{firstName}}/g, user.firstName || '')
      .replace(/{{lastName}}/g, user.lastName || '')
      .replace(/{{userName}}/g, user.userName || '')
      .replace(/{{email}}/g, user.email || '')
      .replace(/{{phone}}/g, user.phone || '');
  }
}
