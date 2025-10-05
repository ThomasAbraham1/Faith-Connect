import { Module } from '@nestjs/common';
import { JwtHelperService } from './jwt-helper.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '365d' },
    }),
  ],
  providers: [JwtHelperService],
  exports: [JwtHelperService],
})

export class JwtHelperModule {}
