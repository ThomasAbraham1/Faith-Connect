import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async create(createMemberDto: CreateMemberDto) {
    try {
      return await this.userModel.insertOne(createMemberDto);
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      return await this.userModel.find();
    } catch (e) {
      return e;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    return await this.userModel.updateOne(updateMemberDto);
  }

  async remove(id: string) {
    return await this.userModel.deleteOne({
      _id: id,
    });
  }
}
