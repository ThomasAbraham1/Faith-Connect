import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class WhatsappService {
  constructor(private readonly twilioService: TwilioService) {}

  async sendMessage(to: string, contentSid: string, contentVariables: string) {
    try {
      const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
      
      const message = await this.twilioService.client.messages.create({
        from: from,
        to: `whatsapp:${to.startsWith('+') ? to : '+' + to}`,
        contentSid: contentSid,
        contentVariables: contentVariables,
      });

      return { success: true, sid: message.sid };
    } catch (error) {
      console.error('Twilio WhatsApp Error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkMessages(phones: string[], contentSid: string, contentVariables: string) {
    const results = [];
    for (const phone of phones) {
      const res = await this.sendMessage(phone, contentSid, contentVariables);
      results.push({ phone, ...res });
    }
    return results;
  }
}
