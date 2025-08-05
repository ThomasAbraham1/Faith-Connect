
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh" ) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      secretOrKey: jwtConstants.secret,
      passReqToCallback:true
    });
  }

  // Getting refresh token from header and verifying it's validity with the refresh token from database
  async validate(req: Request, payload: any) {
    const authHeader = req.get("Authorization");
    if(authHeader && authHeader.startsWith('Bearer')){
      const refreshToken = authHeader.replace('Bearer', '').trim(); // Access the token directly from the request object
      // Refresh token validating function
      return this.authService.refreshToken(refreshToken, payload)
    } else{
      throw new UnauthorizedException('Authorization header is missing or invalid.')
    }
  }
}