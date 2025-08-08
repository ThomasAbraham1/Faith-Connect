import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { TwillioModule } from 'src/otp/twillio/twillio.module';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    TwillioModule,
    DatabaseModule,
    MongooseModule,
    UsersModule,
    PassportModule.register({
      session:true
    }),
    // JwtModule.register({ 
    //   global: true,
    //   secret: jwtConstants.secret,
    //   // signOptions: { expiresIn: '1900s' },  
    // }),
  ], 
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, LocalStrategy],
})
export class AuthModule {}
