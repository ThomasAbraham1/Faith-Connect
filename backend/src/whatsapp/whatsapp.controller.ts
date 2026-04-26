import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  async sendWhatsApp(
    @Body() body: { 
      phones: string[]; 
      contentSid: string; 
      contentVariables: string;
    }
  ) {
    const { phones, contentSid, contentVariables } = body;
    
    if (phones.length === 1) {
      return this.whatsappService.sendMessage(phones[0], contentSid, contentVariables);
    }
    
    return this.whatsappService.sendBulkMessages(phones, contentSid, contentVariables);
  }
}
