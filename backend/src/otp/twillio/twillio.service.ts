import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TwilioService } from 'nestjs-twilio';
import { authenticator } from 'otplib';
import { Otp } from 'src/schemas/Otp.schema';
import { OtpAuthService } from '../otp-auth/otp-auth.service';
interface test {
  name: 'Hello';
}

@Injectable()
export class TwillioService {
  public constructor(
    private readonly twilioService: TwilioService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    private readonly otpAuthService: OtpAuthService,
  ) {}

  async sendSMS(user, phone): Promise<Record<any, any>> {
    const userId = user._id;
    try {
      const token = await this.otpAuthService.createOtp(userId);
      console.log(user, phone);
      return this.twilioService.client.messages.create({
        body: 'Your Faith Connect otp is: ' + token,
        from: '+12297021430',
        to: phone,
      });
    } catch(e) {
      console.error(e)
      return e
    }
  }
}
