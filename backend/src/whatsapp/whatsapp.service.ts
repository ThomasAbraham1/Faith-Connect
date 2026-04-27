import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class WhatsappService {
  constructor(private readonly twilioService: TwilioService) {}

  /** Normalize any phone number to E.164 format (strips spaces, dashes, parens) */
  private sanitizePhone(phone: string): string {
    // Remove all whitespace and common formatting chars
    const cleaned = phone.replace(/[\s\-().]/g, '');
    // Ensure it starts with +
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  async sendMessage(to: string, contentSid: string, contentVariables: string) {
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    const sanitized = this.sanitizePhone(to);

    const message = await this.twilioService.client.messages.create({
      from: from,
      to: `whatsapp:${sanitized}`,
      contentSid: contentSid,
      contentVariables: contentVariables,
    });

    return { success: true, sid: message.sid };
  }

  async sendBulkMessages(phones: string[], contentSid: string, contentVariables: string) {
    const results: any[] = [];
    const errors: string[] = [];

    for (const phone of phones) {
      try {
        const res = await this.sendMessage(phone, contentSid, contentVariables);
        results.push({ phone, ...res });
      } catch (error) {
        console.error(`Twilio WhatsApp Error for ${phone}:`, error);
        errors.push(`${phone}: ${error.message}`);
        results.push({ phone, success: false, error: error.message });
      }
    }

    // If ALL messages failed, throw so the frontend sees an error
    if (results.length > 0 && results.every((r) => !r.success)) {
      throw new Error(`All messages failed: ${errors.join('; ')}`);
    }

    return { results, totalSent: results.filter((r) => r.success).length, totalFailed: errors.length };
  }
}
