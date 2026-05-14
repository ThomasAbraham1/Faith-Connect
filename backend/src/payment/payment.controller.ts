import { Controller, Get, Post, Body, Delete, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('config')
  async getConfig(@Req() req) {
    const churchId = req.user.church._id;
    return this.paymentService.getConfig(churchId);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('config')
  async saveConfig(@Req() req, @Body() body: { keyId: string; keySecret: string }) {
    const churchId = req.user.church._id;
    return this.paymentService.saveConfig(churchId, body.keyId, body.keySecret);
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('config')
  async disconnectConfig(@Req() req) {
    const churchId = req.user.church._id;
    return this.paymentService.disconnectConfig(churchId);
  }

  // PUBLIC endpoint for payment verification
  @Post('verify')
  async verifyPayment(
    @Body() body: { registrationId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) {
    return this.paymentService.verifyPayment(
      body.registrationId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );
  }
}
