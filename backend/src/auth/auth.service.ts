import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Model, MongooseError } from 'mongoose';
import { TwillioService } from 'src/otp/twillio/twillio.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { SignupDto } from './dto/Signup-auth.dto';
import { Twofa } from 'src/schemas/Twofa.schema';
import { JwtHelperService } from 'src/crypt/jwt-helper/jwt-helper.service';
import { Request, Response } from 'express';
import { Church } from 'src/schemas/Church.schema';
import { ChurchesService } from 'src/churches/churches.service';

interface expressUserInterface extends Request{
  user: UserDocument
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Twofa.name) private readonly twofaModel: Model<Twofa>,
    private usersService: UsersService,
    private twillioService: TwillioService,
    private readonly jwthelperService: JwtHelperService,
    private readonly churchesService: ChurchesService,
  ) {}

  async validateUser(username, churchName, password) {
    // Check if church and user exist
    const church = await this.churchesService.findOne(churchName);
    const user = await this.usersService.findOne(username)
    if (!church) {
      throw new UnauthorizedException(
        "Church doesn't exist in this system, please sign up",
      );
    }
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
    return {user, church};
  }

  // Sign up service
  async createUser(SignupDto: SignupDto) {
    try {
      var { churchName, email, phone, ...userInfo } = SignupDto;
      // Find if churchName is duplicate
      const isChurchDuplicate = await this.churchesService.findOne(churchName);
      if (isChurchDuplicate)
        throw new BadRequestException('Church name already exists');
      // Find if userName is duplicate
      const isUserDuplicate = await this.usersService.findOne(
        userInfo.userName,
      );
      if (isUserDuplicate)
        throw new BadRequestException('User name already exists');

      // Insert church and User as none are duplicate records
      const churchInsertResult = await this.churchesService.create({
        churchName: churchName,
        email: email,
        phone: phone,
      });
      const churchId = churchInsertResult._id;
      userInfo ={...userInfo, churchId} 
      const userInsertResult = await this.usersService.createUser(userInfo);


      // console.log(isChurchDuplicate);
      // console.log(userInfo);
      // const church = await newChurch.save();
      // const churchId = church._id;
      // userInfo = { ...userInfo, churchId };
      // const newUser = new this.userModel(userInfo);
      // // console.log(userInfo)
      // const user = await newUser.save();
      // return {...user, ...church}

      // console.log(...churchInsertResult+ ...userInsertResult +" ");
      // console.log(userInsertResult)
      const sessionInfo = {church: churchInsertResult, user:userInsertResult}
      return sessionInfo;
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
