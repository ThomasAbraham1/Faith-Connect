import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { Signature } from 'src/schemas/Signature.schema';
import { SignatureDto } from './dto/signature.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }
  async create(createMemberDto: CreateMemberDto) {
    try {
      const doesUserNameExist = await this.userModel.findOne({ userName: createMemberDto.userName });
      if (doesUserNameExist) {
        throw new ConflictException('Username already exists');
      }
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
    const result = await this.userModel.findOneAndUpdate({ _id: id }, updateMemberDto, {
      new: true
    });
    return result
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

  // Signature related functions
  // Find Signature
  async findSignature(churchId: string) {
    try {
      const result = await this.userModel.findOne({
        churchId: churchId, roles: {
          $in: ['pastor']
        }
      }, { signature: 1, _id: 1 });
      if (!result)
        throw new NotFoundException('Please create a member with pastor role first - For pastors signature')
      return result
    } catch (e) {
      throw e
    }
  }
  //Add signature
  async createSignature(signature: SignatureDto, userId) {
    try {
      const result = await this.userModel.findOneAndUpdate({ _id: userId }, { signature }, {
        new: true
      })
      return result
    } catch (error) {
      throw error
    }
  }
}
