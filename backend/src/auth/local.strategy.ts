import { Injectable, UnauthorizedException } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { Strategy } from 'passport-local';
    import { AuthService } from './auth.service';
    @Injectable()
    export class LocalStrategy extends PassportStrategy(Strategy) {
      constructor(private readonly authService: AuthService) {
        super({
          usernameField: 'churchName'
        });
      }
      async validate(churchName: string, password: string): Promise<any> {
        const churchNameLowercase = churchName.toLowerCase();
        const user = await this.authService.validateUser(churchNameLowercase, password);
        if (!user) {
          throw new UnauthorizedException();
        }
        return user;
      }
    }