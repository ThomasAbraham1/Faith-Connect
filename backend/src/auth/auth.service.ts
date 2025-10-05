import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import mongoose, { Model, MongooseError } from 'mongoose';
import { TwillioService } from 'src/otp/twillio/twillio.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { SignupDto } from './dto/Signup-auth.dto';
import { Twofa } from 'src/schemas/Twofa.schema';
import { JwtHelperService } from 'src/crypt/jwt-helper/jwt-helper.service';
import { Request, Response } from 'express';
import { Church } from 'src/schemas/Church.schema';
import { ChurchesService } from 'src/churches/churches.service';
import { MongoServerError } from 'mongodb';

interface expressUserInterface extends Request {
  user: UserDocument
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Church.name) private churchModel: Model<Church>,
    @InjectModel(Twofa.name) private readonly twofaModel: Model<Twofa>,
    private readonly usersService: UsersService,
    private twillioService: TwillioService,
    private readonly jwthelperService: JwtHelperService,
    private readonly churchesService: ChurchesService,
  ) { }
  async validateUser(username, churchName, password) {
    const session = await this.userModel.startSession();
    // Check if church and user exist
    var user;
    var church;
    try {
      await session.withTransaction(async () => {
        church = await this.churchesService.findOne(churchName);
        const churchId = church?._id;
        if (!churchId) {
          throw new UnauthorizedException(
            "Church doesn't exist in this system, please sign up",
          );
        }
        user = await this.usersService.findOne({ userName: username, churchId: churchId });
        if (!user) {
          throw new UnauthorizedException(
            `User doesn't exist within ${church.churchName}, please contact administrator`,
          );
        }
        if (user?.password !== password) {
          console.log(
            'Db password: ' + user?.password + '/n login Password: ' + password,
          );
          throw new UnauthorizedException("Password didn't match");
        }
        // console.log(user + '/n' + smsResponse);
      });
      return { user, church };
    } catch (e) {
      console.error('Transaction failed: ', e);
      throw e
    }
  }

  // Sign up service
  async createUser(SignupDto: SignupDto) {
    const session = await this.userModel.startSession();
    let sessionInfo: { church: any, user: any } | null = null;

    try {
      console.log('Starting transaction for createUser...');
      await session.withTransaction(async () => {
        const { churchName, email, phone, ...userInfo } = SignupDto;

        // // Insert Church
        // console.log('Inserting church...');
        const churchInsertResult = await this.churchesService.create(
          { churchName, email, phone },
          session, // pass the session
        );
        // const churchInsertResult = await this.churchModel.insertOne({ churchName, email, phone }, { session })
        // userInfo.churchId = churchInsertResult._id;

        // Insert User
        console.log('Inserting user...');
        console.log(userInfo)
        userInfo.churchId = churchInsertResult._id;
        const userRole = churchInsertResult.roles.find(role => (role.name == 'admin' || role.name == 'Admin' || role.name == 'ADMIN'));
        console.log(userRole)
        if(!userRole) throw new BadRequestException('No admin role found in church roles')
        userInfo.roles = [userRole._id as any as string];
        console.log(userInfo)
        // userInfo.roles = ['Admin']; // Default role assignment
        const userInsertResult = await this.usersService.createUser(userInfo, session);
        // const userInsertResult = await this.userModel.insertOne(userInfo, { session });

        sessionInfo = { church: churchInsertResult, user: userInsertResult };
        console.log('Transaction operations completed.');
      });

      console.log('Transaction committed successfully.');
      return sessionInfo;
    } catch (e: any) {
      console.log('Transaction failed:', e);

      // Handle duplicate key errors
      if (e.code === 11000 && e.keyValue) {
        const field = Object.keys(e.keyValue)[0];
        const value = e.keyValue[field];

        e.custom = {
          code: 1100,
          field,
          value,
          redirectPage: 'signup',
          message: `The name '${value}' already exists`,
        };
      }

      // Mongoose validation errors
      if (e instanceof mongoose.Error.ValidationError) {
        (e as any).custom = { code: 'VALIDATION_ERROR' };
      }

      throw e;
    } finally {
      await session.endSession();
      console.log('Session ended.');
    }
  }





  // Check if rememberDeviceToken exists for the userz
  async twofaMemoryCheck(rememberDeviceToken: string, responseObject: Request) {
    try {
      const doesDeviceExist = await this.twofaModel.findOne({
        rememberDeviceToken: rememberDeviceToken,
      });
      // find if device exists in DB (2fa document)
      console.log(doesDeviceExist);
      const sessionInfo = responseObject.user as expressUserInterface;
      const userId = (sessionInfo.user)._id;
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
