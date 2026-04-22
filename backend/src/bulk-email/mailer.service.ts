import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// One email job — contains everything needed to send a single email.
export interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

/**
 * MailerService is responsible for ACTUALLY SENDING a single email.
 *
 * In development  → uses Nodemailer + Mailtrap (a safe sandbox — no real emails sent)
 * In production   → uses AWS SES (Amazon's bulk email service)
 *
 * The rest of the app doesn't need to care which one is being used.
 */
@Injectable()
export class MailerService {
  // Logger lets us print messages to the console with a nice prefix.
  private readonly logger = new Logger(MailerService.name);

  // This is the AWS SES client — only used in production.
  private sesClient: SESClient;

  constructor(private readonly configService: ConfigService) {
    // Only create the SES client if we're in production.
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      this.sesClient = new SESClient({
        region: this.configService.get<string>('AWS_REGION')!,
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
        },
      });
    }
  }

  /**
   * Sends a single email. Internally decides whether to use Mailtrap or SES.
   */
  async sendOne(job: EmailJob): Promise<void> {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (isProduction) {
      await this.sendViaSes(job);
    } else {
      await this.sendViaMailtrap(job);
    }
  }

  // ─── MAILTRAP (Development) ────────────────────────────────────────────────
  // Nodemailer connects to Mailtrap's SMTP server.
  // Emails land in your Mailtrap inbox — nothing reaches real people.
  private async sendViaMailtrap(job: EmailJob): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILTRAP_HOST'),
      port: this.configService.get<number>('MAILTRAP_PORT'),
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),
        pass: this.configService.get<string>('MAILTRAP_PASS'),
      },
    });

    await transporter.sendMail({
      from: 'Faith Connect <no-reply@faithconnect.local>',
      to: job.to,
      subject: job.subject,
      html: job.body,
    });

    this.logger.log(`[DEV] Email sent to ${job.to} via Mailtrap`);
  }

  // ─── AWS SES (Production) ─────────────────────────────────────────────────
  // AWS SES is Amazon's high-volume email service.
  // Requires a verified sender email in the AWS console.
  private async sendViaSes(job: EmailJob): Promise<void> {
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');

    const command = new SendEmailCommand({
      Source: `Faith Connect <${fromEmail}>`,
      Destination: {
        ToAddresses: [job.to],
      },
      Message: {
        Subject: { Data: job.subject },
        Body: {
          Html: { Data: job.body },
        },
      },
    });

    await this.sesClient.send(command);
    this.logger.log(`[PROD] Email sent to ${job.to} via AWS SES`);
  }
}
