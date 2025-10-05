import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model, Types } from 'mongoose';
import { authenticator } from 'otplib';
import { JwtHelperService } from 'src/crypt/jwt-helper/jwt-helper.service';
import { Otp } from 'src/schemas/Otp.schema';
import { Twofa } from 'src/schemas/Twofa.schema';

@Injectable()
export class OtpAuthService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectModel(Twofa.name) private readonly twofaModel: Model<Twofa>,
    private readonly jwthelperService: JwtHelperService,
  ) { }
  async createOtp(userId: Types.ObjectId) {
    const secret = authenticator.generateSecret();
    authenticator.options = {
      digits: 6,
      step: 5 * 60, // Time step in seconds
    };

    // Storing temporarily the secret code
    this.otpModel
      .findOneAndUpdate(
        { _id: userId },
        { _id: userId, secret: secret },
        { upsert: true, new: true },
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
    // Generate a TOTP code
    const token = authenticator.generate(secret);
    console.log(token);
    return token;
  }

  async verifyOtp(token: string, userId: string, responseObj: Response) {
    // Verify TOTP code
    try {
      const response = await this.otpModel.findOne({ _id: userId });
      const secret = response?.secret;
      if (!secret) {
        throw new NotFoundException(
          'OTP has either expired or there is not one sent yet. Try again',
        );
      }
      const isValid = authenticator.verify({ token, secret });

      // Calling JWT service for REMEMBER DEVICE token

      if (isValid) {
        // console.log(process.env.JWT_SECRET)
        const rememberDeviceToken =
          await this.jwthelperService.createjwtToken(userId);
        await this.twofaModel.insertOne({
          userId: userId,
          rememberDeviceToken: rememberDeviceToken,
        });
        responseObj.cookie('rememberDeviceToken', rememberDeviceToken, {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          secure: true, // only over HTTPS in prod
          sameSite: 'strict',
        });
      }
      console.log('IsOtpValid:', isValid)
      if (isValid) return { isOtpValid: isValid }
      throw new NotFoundException('The OTP entered is invalid');
    } catch (e) {
      console.error(e);
      throw e
    }
  }
}
