import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule,
    UsersModule,
    JwtModule.register({ 
      global: true,
      secret: jwtConstants.secret,
      // signOptions: { expiresIn: '1900s' },  
    }),
  ], 
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
