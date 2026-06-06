import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BulkEmailService } from './bulk-email.service';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

/**
 * BulkEmailController exposes the HTTP endpoint for the bulk email feature.
 *
 * Route: POST /bulk-email/send
 *
 * @UseGuards(AuthenticatedGuard) protects this route — only logged-in users can use it.
 * In the future you can also add a role check here to restrict to admins only.
 */
@UseGuards(AuthenticatedGuard)
@Controller('bulk-email')
export class BulkEmailController {
  constructor(private readonly bulkEmailService: BulkEmailService) { }

  /**
   * POST /bulk-email/send
   *
   * Request body (JSON):
   * {
   *   "memberIds": ["abc123", "def456"],   ← MongoDB _id strings of recipients
   *   "subject": "Sunday Service Update",
   *   "body": "<p>Hello everyone...</p>"   ← Can be HTML or plain text
   * }
   *
   * Response:
   * {
   *   "message": "Emails queued successfully.",
   *   "queued": 10,
   *   "skipped": 2,
   *   "skippedNames": ["John Doe", "Jane Smith"]  ← members with no email on file
   * }
   */
  @Post('send')
  async sendBulkEmail(@Req() req, @Body() dto: SendBulkEmailDto) {
    const churchId = req.user.church._id;
    const result = await this.bulkEmailService.sendBulkEmail(dto, churchId);

    return {
      message: 'Emails queued successfully.',
      ...result,
    };
  }
}
