import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { QueueService } from './queue.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

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
    // Inject QueueService so we can push email jobs
    private readonly queueService: QueueService,
  ) {}

  /**
   * Main method — called by the controller when admin hits "Send".
   *
   * Steps:
   * 1. Look up each member by their MongoDB _id
   * 2. Skip members that don't have an email address (and log it)
   * 3. Push one message into the SQS queue per valid recipient
   * 4. Return a summary of what happened
   */
  async sendBulkEmail(dto: SendBulkEmailDto): Promise<{
    queued: number;
    skipped: number;
    skippedNames: string[];
  }> {
    // Find all users whose _id is in the memberIds array.
    // $in is a MongoDB operator meaning "find documents where _id is one of these values".
    const members = await this.userModel.find({
      _id: { $in: dto.memberIds },
    });

    if (members.length === 0) {
      throw new NotFoundException('No members found with the provided IDs.');
    }

    let queued = 0;
    let skipped = 0;
    const skippedNames: string[] = [];

    for (const member of members) {
      // Skip this member if they don't have an email address stored.
      if (!member.email) {
        const name = member.firstName || member.userName || 'Unknown';
        this.logger.warn(`Skipping ${name} — no email address on file.`);
        skipped++;
        skippedNames.push(name);
        continue;
      }

      // Replace dynamic placeholders in subject and body
      const personalizedSubject = this.replacePlaceholders(dto.subject, member);
      const personalizedBody = this.replacePlaceholders(dto.body, member);

      // Push the email job to SQS. The QueueService will pick it up and send it.
      await this.queueService.enqueue({
        to: member.email,
        subject: personalizedSubject,
        body: personalizedBody,
      });

      queued++;
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
