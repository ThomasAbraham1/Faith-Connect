import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtHelperService {
  constructor(private readonly jwtService: JwtService) {}

  async createjwtToken(payload: string): Promise<string> {
    // console.log(process.env.JWT_SECRET);

    return await this.jwtService.signAsync(
      { payload },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '365d',
      },
    );
  }

  async validateToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}
