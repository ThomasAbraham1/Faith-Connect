import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { TwillioService } from 'src/otp/twillio/twillio.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
    private twillioService: TwillioService
  ) {}

  async signIn(
    username: string,
    churchName: string,
    pass: string,
    phone: string,
    email: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    updated_db_document: object | null;
  }> {
    const user = await this.usersService.findOne(churchName);
    if (!user) {
      throw new UnauthorizedException(
        "Church doesn't exist in this system, please sign up",
      );
    }
    if (user?.password !== pass) {
      console.log(
        'Db password: ' + user?.password + '/n login Password: ' + pass,
      );
      throw new UnauthorizedException("Password didn't match");
    }
    const smsResponse = await this.twillioService.sendSMS(user);
    console.log(user + "/n" + smsResponse);
    const payload = { sub: user._id , churchName: user.churchName };
    // const [accessToken, refreshToken] = await Promise.all([
      // this.jwtService.signAsync(payload, {
      //   expiresIn: '20s',
      // }),
      // this.jwtService.signAsync(payload, {
      //   expiresIn: '7d',
      // }),
    // ]);
    // Storing the refresh token in the database
    // const result = await this.userModel.findOneAndUpdate(
    //   { churchName: churchName },
    //   { refresh_token: refreshToken },
    //   { new: true },
    // );
    // console.log(result);
    // return {
    //   access_token: accessToken,
    //   refresh_token: refreshToken,
    //   updated_db_document: result,
    // };
    return {} as Promise<{
    access_token: string;
    refresh_token: string;
    updated_db_document: object | null;
  }>
  }

  async refreshToken(refreshToken, payloadPriorToValidation) {
    // const payload = { sub: }
    // const newRefreshToken = await this.jwtService.signAsync()
    const refreshTokenSearchResult = await this.userModel.findOne({
      refresh_token: refreshToken,
    });
    const userId = refreshTokenSearchResult?._id;
    const churchName = refreshTokenSearchResult?.churchName;
    const payload = { sub: userId, churchName: churchName };
    // Throw error if refreshtoken isn't matching the one stored in DB
    // if (!refreshTokenSearchResult)
    //   throw new UnauthorizedException('Invalid JWT refresh token');
    // // Create new access and refresh tokens
    // const [new_access_token, new_refresh_token] = await Promise.all([
    //   this.jwtService.signAsync(payload, {
    //     expiresIn: '20s',
    //   }),
    //   this.jwtService.signAsync(payload, {
    //     expiresIn: '7d',
    //   }),
    // ]);
    // // Document after updating the user record with new refresh token
    // const result = await this.userModel.findOneAndUpdate(
    //   { _id: userId },
    //   { refresh_token: new_refresh_token },
    //   { new: true },
    // );
    // return {
    //   userId: payloadPriorToValidation.sub,
    //   churchName: payloadPriorToValidation.churchName,
    //   new_access_token: new_access_token,
    //   new_refresh_token: new_refresh_token,
    //   updated_db_document: result,
    // };
  }
async validateUser(churchName, password){
 const user = await this.usersService.findOne(churchName)
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
    return user;
}



}
