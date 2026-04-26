import { Controller, Get, Post, Query, Res, HttpStatus, Body } from '@nestjs/common';
import { Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
  
  // Meta uses this GET request to verify you actually own the server
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const myVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === myVerifyToken) {
      console.log('WEBHOOK_VERIFIED');
      // Meta requires you to send back the exact challenge string they sent as a plain text response
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  // Handle incoming notifications
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    console.log('Incoming WhatsApp Webhook:', JSON.stringify(body, null, 2));
    return { status: 'ok' };
  }
}
