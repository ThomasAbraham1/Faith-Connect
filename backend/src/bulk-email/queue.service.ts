import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  CreateQueueCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { EmailJob, MailerService } from './mailer.service';
import { InjectModel, ModelDefinition } from '@nestjs/mongoose';
import { Batch } from 'src/schemas/Batch.schema';
import { Model } from 'mongoose';
import { EmailLog, EmailLogType } from 'src/schemas/EmailLog.schema';
/**
 * QueueService handles putting email jobs INTO the queue and consuming them FROM the queue.
 *
 * Think of SQS like a to-do list:
 *   - BulkEmailService WRITES jobs onto the list (one per recipient).
 *   - QueueService READS jobs off the list and sends the emails.
 *
 * In development  → SQS runs inside LocalStack (our local fake AWS Docker container)
 * In production   → SQS runs on real AWS
 *
 * OnModuleInit means NestJS calls `onModuleInit()` automatically when the app starts.
 */
@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  // The SQS client from the AWS SDK — same code works for LocalStack and real AWS.
  private sqsClient: SQSClient;

  // The URL of our queue — we get this after creating/finding the queue.
  private queueUrl: string;

  // Whether to keep polling for new messages. Set to false to stop the consumer.
  private isConsuming = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @InjectModel(Batch.name) private readonly batchModel: Model<Batch>,
    @InjectModel(EmailLog.name) private readonly emailLogModel: Model<EmailLog>,
  ) { }

  /**
   * Called automatically by NestJS when the app starts.
   * Sets up the SQS client, ensures the queue exists, then starts consuming.
   */
  async onModuleInit() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
      },
      // In development, point to LocalStack instead of real AWS.
      // In production, leave endpoint undefined so the SDK uses the real AWS endpoint.
      ...(isProduction
        ? {}
        : { endpoint: this.configService.get<string>('SQS_ENDPOINT') || 'http://localhost:4566' }),
    });

    // Make sure the queue exists (creates it if it doesn't).
    await this.ensureQueueExists();

    // Start listening for messages in the background.
    this.startConsuming();
  }

  /**
   * Creates the SQS queue if it doesn't already exist.
   * SQS's CreateQueue is idempotent — safe to call even if queue already exists.
   */
  private async ensureQueueExists(): Promise<void> {
    const queueName = this.configService.get<string>('SQS_QUEUE_NAME') || 'bulk-email-queue';

    try {
      const result = await this.sqsClient.send(
        new CreateQueueCommand({ QueueName: queueName }),
      );
      this.queueUrl = result.QueueUrl!;
      this.logger.log(`SQS queue ready: ${this.queueUrl}`);
    } catch (error) {
      this.logger.error('Failed to create/find SQS queue', error);
      throw error;
    }
  }

  /**
   * Adds a single email job to the SQS queue.
   * We serialize the job to JSON so SQS can store it as a string.
   */
  async enqueue(job: EmailJob): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(job), // Store the email job as a JSON string
      }),
    );
    this.logger.log(`Enqueued email for: ${job.to}`);
  }

  /**
   * Starts a continuous polling loop in the background.
   * Every 2 seconds, it checks the queue for new messages and sends them.
   *
   * "Long polling" (WaitTimeSeconds: 5) means SQS will hold our request open
   * for up to 5 seconds if the queue is empty, instead of returning immediately.
   * This reduces the number of empty requests (saves cost on real AWS).
   */
  private startConsuming(): void {
    this.isConsuming = true;
    this.logger.log('Starting SQS consumer — polling for emails to send...');

    // Run the poll loop asynchronously so it doesn't block app startup.
    this.pollLoop().catch((err) =>
      this.logger.error('Consumer poll loop crashed', err),
    );
  }

  private async pollLoop(): Promise<void> {
    while (this.isConsuming) {
      try {
        // Ask SQS for up to 10 messages at once.
        const result = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 5, // Long polling — waits up to 5s if queue is empty
          }),
        );
        const messages = result.Messages ?? [];

        for (const message of messages) {
          let job: EmailJob | null = null;
          try {
            // Parse the JSON we stored in enqueue()
            job = JSON.parse(message.Body!);

            // Send the actual email
            await this.mailerService.sendOne(job!);

            // 1. Create the EmailLog to track this specific recipient's success
            const emailLog = await this.emailLogModel.findByIdAndUpdate(job?.emailLogId,{
              churchId: job?.churchId,
              batchId: job?.batchId,
              recipientEmail: job?.to,
              subject: job?.subject,
              type: 'BULK', // from your EmailLogType enum
              status: 'SENT'
            });



            // Tell SQS "I've processed this — delete it from the queue" 
            await this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle!,
              }),
            );

            // Small delay between sends so we don't hammer Mailtrap or SES.
            // 200ms = 5 emails/second max. Adjust as needed.
            await this.sleep(10000);
          } catch (err: any) {
            this.logger.error(`Failed to process message for ${message.MessageId}: ${err.message}`, err);

            // --- SMART DROP LOGIC ---
            // If the error is permanent (4xx), we drop the job to stop the retry loop.
            // AWS SES returns 400 for things like "Email address not verified" or "Invalid address".
            const httpStatus = err.statusCode || err.$metadata?.httpStatusCode;
            const isPermanentFailure = httpStatus && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429;

            if (isPermanentFailure) {
              const recipient = job?.to || 'unknown recipient';
              this.logger.warn(`PERMANENT FAILURE: Dropping email job for ${recipient}. Reason: ${err.name}`);

              // Delete it from the queue so it doesn't retry
              await this.sqsClient.send(
                new DeleteMessageCommand({
                  QueueUrl: this.queueUrl,
                  ReceiptHandle: message.ReceiptHandle!,
                }),
              );
            } else {
              const recipient = job?.to || 'unknown recipient';
              this.logger.warn(`TRANSIENT FAILURE: Keeping job for ${recipient} in queue for retry.`);
              // We don't delete the message — SQS will retry it after a visibility timeout.
            }
            // Updating email log with FAILED status
            await this.emailLogModel.findByIdAndUpdate(job?.emailLogId, {
              status: 'FAILED', 
              error: err?.message
            });
          }
        }
      } catch (err) {
        // If polling itself fails (e.g. LocalStack not running), wait 5s before retrying.
        this.logger.error('Error polling SQS queue', err);
        await this.sleep(5000);
      }
    }
  }

  /** Simple sleep helper — waits `ms` milliseconds before continuing. */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
