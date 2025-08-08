import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TwilioService } from 'nestjs-twilio';
import { authenticator } from 'otplib';
import { Otp } from 'src/schemas/Otp.schema';

@Injectable()
export class TwillioService {
  public constructor(private readonly twilioService: TwilioService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>
  ) {}

  async sendSMS(userId) {
    const secret = authenticator.generateSecret(); 
    authenticator.options = {
      step: 30, // Time step in seconds
    };

    // Storing temporarily the secret code
this.otpModel.findOne({_id: userId})
    // Generate a TOTP code
    const token = authenticator.generate(secret);
    console.log(secret);

    return this.twilioService.client.messages.create({
      body: 'Your Faith Connect otp is: ' + secret,
      from: '+12297021430',
      to: '+919385341273',
    });
  }

  async verifyOtp() {
    // Verify a TOTP code
    // const isValid = authenticator.verify({ token, secret });
  }
}
