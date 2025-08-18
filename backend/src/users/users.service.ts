import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { filter } from "rxjs";
import { User } from "src/schemas/User.schema";
import { CreateUserDto } from "./dto/CreateUser.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ){}
    async createUser(createUserDto:any){
        try{
            const newUser = new this.userModel(createUserDto)
            return await newUser.save();
        }catch(e){
            throw new BadRequestException(e)
        }
    }

    async findOne(churchName: string): Promise<CreateUserDto | null> {
    return this.userModel.findOne({churchName: churchName});
}
//  async refreshToken(refreshToken): Promise<{accessToken, refreshToken, churchName}>{
//     return {
//       accessToken, refreshToken, churchName
//     }
//   }
}