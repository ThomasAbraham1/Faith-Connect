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
  ) { }
  async createUser(createUserDto: CreateUserDto, session?) {
    const reuslt = await this.userModel.insertOne(createUserDto,);
    return reuslt

  }

  async findAll() {
    try {
      return await this.userModel.find();
    } catch (e) {
      return e;
    }
  }

  async findOne(filter: Record<string, any>): Promise<any> {
    return this.userModel.findOne(filter);
  }

  remove(id: string) {
    return this.userModel.deleteOne({
      _id: id,
    });
  }
}
