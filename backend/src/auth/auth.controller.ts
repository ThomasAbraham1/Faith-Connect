import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.guard';
import { AuthenticatedGuard } from './authenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  //Post / Login
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

  @Post('refresh')
  // @UseGuards(JwtRefreshAuthGuard)
  refreshToken(@Request() req) {
    return req.user;
    console.log(req.user);
  }
}
