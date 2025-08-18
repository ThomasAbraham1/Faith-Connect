import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Response,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { TwillioService } from 'src/otp/twillio/twillio.service';
import { OtpAuthService } from 'src/otp/otp-auth/otp-auth.service';
import { SignupDto } from './dto/Signup-auth.dto';
import {
  Request as expressRequest,
  Response as expressResponse,
} from 'express';
import { UserDocument, userSchema } from 'src/schemas/User.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twillioService: TwillioService,
    private readonly otpAuthService: OtpAuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  // Login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): any {
    return { User: req.user, msg: 'User logged in' };
  }

  //Get / protected
  @UseGuards(AuthenticatedGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Request() req) {
    const user = await this.authService.createUser(signupDto);

    return new Promise((resolve, reject) => {
      req.login(user, (err: any) => {
        if (err) {
          return reject(err);
        }
        resolve({ message: 'Signup successful', user });
      });
    });
  }

  // OTP request
  @UseGuards(AuthenticatedGuard)
  @Post('otpRequest')
  async otpRequest(@Request() req) {
    const { phone, ...user } = req.user;
    const smsResponse = await this.twillioService.sendSMS(user, phone);
    return smsResponse;
  }
  //  2FA memory check
  @UseGuards(AuthenticatedGuard)
  @Post('twofaMemoryCheck')
  async twofaMemoryCheck(@Request() req: expressRequest) {
    try {
      if (!req.cookies['rememberDeviceToken'])
        throw new NotFoundException('Remember Device Token was not found');
      const rememberDeviceToken = req.cookies['rememberDeviceToken'];
      return this.authService.twofaMemoryCheck(rememberDeviceToken, req);
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  // Veriyfing
  @UseGuards(AuthenticatedGuard)
  @Post('verifyOtp')
  // @UseGuards(JwtRefreshAuthGuard)
  async verifyOtp(@Request() req, @Response() res: expressResponse) {
    const userId = req.user._id;
    const otp = req.body.otpToken;
    const isVerified = await this.otpAuthService.verifyOtp(otp, userId, res);
    res.send(isVerified);
    console.log(req.body);
  }
}
