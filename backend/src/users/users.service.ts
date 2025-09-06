import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { filter } from 'rxjs';
import { User } from 'src/schemas/User.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import { Church } from 'src/schemas/Church.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Church.name) private churchModel: Model<Church>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    try {
      return await this.userModel.insertOne(createUserDto);
    } catch (e) {
      return e;
    }
  }

  async findAll() {
    try {
      return await this.userModel.find();
    } catch (e) {
      return e;
    }
  }

  async findOne(userName: string): Promise<CreateUserDto | null> {
    return this.userModel.findOne({ userName: userName });
  }

  remove(id: string) {
    return this.userModel.deleteOne({
      _id: id,
    });
  }
}
