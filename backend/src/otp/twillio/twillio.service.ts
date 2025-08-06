import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class TwillioService {
  public constructor(private readonly twilioService: TwilioService) {}

  async sendSMS() {
    return this.twilioService.client.messages.create({
      body: '!',
      from: '+12297021430',
      to: '+919385341273',
    });
  }
}
