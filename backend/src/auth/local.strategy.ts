import { Injectable, UnauthorizedException } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { Strategy } from 'passport-local';
    import { AuthService } from './auth.service';
import { Request } from 'express';
    @Injectable()
    export class LocalStrategy extends PassportStrategy(Strategy) {
      constructor(private readonly authService: AuthService) {
        super({
          usernameField: 'churchName',
          passReqToCallback: true,
        });
      }
      async validate(req: Request,churchName: string, password: string): Promise<any> {
        const username = req.body.userName;
        console.log(username)
        const churchNameLowercase = churchName.toLowerCase();
        const user = await this.authService.validateUser(username, churchNameLowercase, password);
        // if (!user) {
        //   throw new UnauthorizedException();
        // }
        return user;
      }
    }