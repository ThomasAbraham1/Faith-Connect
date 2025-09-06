import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import * as nodemailer from 'nodemailer';
import { OtpAuthService } from '../otp-auth/otp-auth.service';
import { htmlContentGenerator } from './htmlContent';

@Injectable()
export class EmailService {
  constructor(
    private readonly otpService: OtpAuthService,
    private readonly htmlcontentGeneratorService: htmlContentGenerator,
  ) {}

  async sendEmail(user: UserDocument, email: string) {
    const userId = user._id;
    const username = user.userName;
    console.log(email, userId);

    // Get OTP from OTP module
    const otp = await this.otpService.createOtp(userId);
    // Get html content
    const htmlContent = this.htmlcontentGeneratorService.htmlContentGenerator(
      username,
      otp,
    );

    // Config - Nodemailer with email credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cta102938@gmail.com',
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    // Send email config
    const info = await transporter.sendMail({
      from: 'Faith Connect <cta102938@gmail.com>',
      to: email,
      subject: '♰ Your Faith Connect Verification Code ♰',
      text: `Your faith connect OTP is `, // plain‑text body
      html: htmlContent, // HTML body
    });
    console.log('Message sent:', info.messageId);
    return info.messageId;
  }
} 
