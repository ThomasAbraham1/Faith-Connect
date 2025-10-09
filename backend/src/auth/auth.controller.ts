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
  Req,
  InternalServerErrorException,
  Res,
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
import { EmailService } from 'src/otp/email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twillioService: TwillioService,
    private readonly otpAuthService: OtpAuthService,
    private readonly emailService: EmailService,
  ) { }

  @HttpCode(HttpStatus.OK)
  // Login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): any {
    return { UserInfo: req.user, msg: 'User logged in' };
  }

  //Get / protected
  @UseGuards(AuthenticatedGuard)
  @Get('protected')
  getHello(@Request() req): string {
    return req.user;
  }

  // Signup
  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Request() req) {
    const user = await this.authService.createUser(signupDto);
    console.log(user);

    return new Promise((resolve, reject) => {
      req.login(user, (err: any) => {
        if (err) {
          return reject(err);
        }
        // console.log(req.user)
        resolve({ message: 'Signup successful', userInfo: user });
      });
    });
  }

  // OTP request
  @UseGuards(AuthenticatedGuard)
  @Post('otpRequest')
  async otpRequest(@Request() req) {
    console.log(req.user);
    const user = req.user.user;
    const { phone, email } = req.user.church;
    // const { phone, email, ...user } = req.user.user;
    const otpMethod = req.body.method;
    let response;
    if (otpMethod == 'sms')
      response = await this.twillioService.sendSMS(user, phone);
    else response = await this.emailService.sendEmail(user, email);
    return response;
  }

  //  2FA memory check
  @UseGuards(AuthenticatedGuard)
  @Post('twofaMemoryCheck')
  async twofaMemoryCheck(@Request() req: expressRequest) {
    try {
      if (!req.cookies['rememberDeviceToken'])
        // throw new NotFoundException('Remember Device Token was not found');
        return { doesDeviceExist: false };
      const rememberDeviceToken = req.cookies['rememberDeviceToken'];
      return this.authService.twofaMemoryCheck(rememberDeviceToken, req);
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  // Logout
  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  async logout(@Req() req: expressRequest, @Res() res: expressResponse) {
    req.session.destroy((err) => {
      if (err) throw new InternalServerErrorException('Login error');

      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'logged out successsfully' });
    });
  }

  // @UseGuards(AuthenticatedGuard)
  @Get('/me')
  async getUserInfo(@Request() req) {
    return req.user;
  }

  // Veriyfing
  @UseGuards(AuthenticatedGuard)
  @Post('verifyOtp')
  // @UseGuards(JwtRefreshAuthGuard)
  async verifyOtp(@Request() req, @Response() res: expressResponse) {
    console.log(req.user);
    const userId = req.user.user._id;
    const otp = req.body.otpToken;
    const isVerified = await this.otpAuthService.verifyOtp(otp, userId, res);
    res.send(isVerified);
    // console.log(req.body);
  }

  @Post('spinner')
  async spinner() {
    return 'May friend'
  }
}
