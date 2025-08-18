import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { TwillioService } from 'src/otp/twillio/twillio.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { SignupDto } from './dto/Signup-auth.dto';
import { Twofa } from 'src/schemas/Twofa.schema';
import { JwtHelperService } from 'src/crypt/jwt-helper/jwt-helper.service';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Twofa.name) private readonly twofaModel: Model<Twofa>,
    private usersService: UsersService,
    private twillioService: TwillioService,
    private readonly jwthelperService: JwtHelperService,
  ) {}

  async validateUser(churchName, password) {
    const user = await this.usersService.findOne(churchName);
    if (!user) {
      throw new UnauthorizedException(
        "Church doesn't exist in this system, please sign up",
      );
    }
    if (user?.password !== password) {
      console.log(
        'Db password: ' + user?.password + '/n login Password: ' + password,
      );
      throw new UnauthorizedException("Password didn't match");
    }
    // console.log(user + '/n' + smsResponse);
    return user;
  }

  // Sign up service
  async createUser(SignupDto: any) {
    try {
      const newUser = new this.userModel(SignupDto);
      const user = await newUser.save();
      // console.log(user + '/n' + smsResponse);
      return user;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  // Check if rememberDeviceToken exists for the user
  async twofaMemoryCheck(rememberDeviceToken: string, responseObject: Request) {
    try {
      const doesDeviceExist = await this.twofaModel.findOne({
        rememberDeviceToken: rememberDeviceToken,
      });
      // find if device exists in DB (2fa document)
      console.log(doesDeviceExist);
      const userId = (responseObject.user as UserDocument)._id;
      const jwtPayload =
        await this.jwthelperService.validateToken(rememberDeviceToken);
      console.log(jwtPayload);
      const userIdfromJwt = jwtPayload.payload;
      // Check if device id exists
      if (!doesDeviceExist || userIdfromJwt != userId)
        return { doesDeviceExist: false };
      return { doesDeviceExist: true };
    } catch (e) {
      console.error(e);
      return e;
    }
  }
}
