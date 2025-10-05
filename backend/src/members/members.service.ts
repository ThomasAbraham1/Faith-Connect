import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }
  async create(createMemberDto: CreateMemberDto) {
    try {
      return await this.userModel.insertOne(createMemberDto);
    } catch (error) {
      throw error;
    }
  }

  async findAll(churchId: string) {
    try {
      return await this.userModel.find({ churchId: churchId });
    } catch (e) {
      return e;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userModel.findOne({
        _id: id
      })
    } catch (error) {
      console.error(error);
      return error
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto, userSessionObject: { user: CreateMemberDto }) {
    console.log(id, updateMemberDto, userSessionObject)
    const userInfo: CreateMemberDto = await this.findOne(id);
    console.log(userInfo)
    if (userInfo.profilePic) {
      const profilePicPath = userInfo.profilePic.profilePicPath;
      this.deleteExistingPicture(profilePicPath);
    }
    return await this.userModel.updateOne({ _id: id }, updateMemberDto);
  }

  deleteExistingPicture(profilePicPath: string) {
    fs.unlink(profilePicPath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log('File deleted successfully!');
    })
  }

  async remove(id: string) {
    // Check for profile picture and delete it
    const userInfo: CreateMemberDto = await this.findOne(id);
    console.log(userInfo)
    if (userInfo.profilePic) {
      const profilePicPath = userInfo.profilePic.profilePicPath;
      this.deleteExistingPicture(profilePicPath);
    }
    return await this.userModel.deleteOne({
      _id: id,
    });
  }

  deleteProfilePicture(profilePicPath: string) {

  }
}
