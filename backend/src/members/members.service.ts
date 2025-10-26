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
    // check if username exists
    if (updateMemberDto.userName) {
      const doesUserNameExist = await this.userModel.findOne({ userName: updateMemberDto.userName });
      if (doesUserNameExist) {
        throw new ConflictException('Username already exists');
      }
    }


    console.log(id, updateMemberDto, userSessionObject)
    const userInfo: CreateMemberDto = await this.findOne(id);
    console.log(userInfo)
    if (userInfo?.profilePic) {
      const profilePicPath: string[] = [userInfo.profilePic.profilePicPath];
      this.deleteExistingPicture(profilePicPath);
    }
    const result = await this.userModel.findOneAndUpdate({ _id: id }, updateMemberDto, {
      new: true,
    });
    return result
  }

  async deleteExistingPicture(profilePicPaths: string[]) {
    for (const filePath of profilePicPaths) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          console.log(`File deleted: ${filePath}`);
        } else {
          console.log(`File not found: ${filePath}`);
          // throw new ConflictException(`Error deleting file at ${filePath}`)
        }
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
        throw new ConflictException(`Error deleting file at ${filePath}`)
      }
    }
  }

  async remove(id: string[] | string) {
    // Create session for file deletion and db deletion sync
    const session = await this.userModel.startSession();
    var deleteResult;
    try {

      await session.withTransaction(async () => {

        // Check for profile picture and delete it
        const userInfo: CreateMemberDto[] = await this.userModel.find({ _id: { $in: id } }, null, { session });

        // Delete the records from database
        deleteResult = await this.userModel.deleteMany({
          _id: { $in: id },
        }, { session });

        const picturesToDelete = userInfo.filter((value) => value.profilePic).map((value) => value.profilePic.profilePicPath)
        console.log(picturesToDelete);

        // Check pictures to delete length and call file deleter
        if (picturesToDelete.length > 0)
          await this.deleteExistingPicture(picturesToDelete);
      })
      return deleteResult
    }
    catch (e) {
      console.log("Transaction Error: ", e)
      throw e
    }
    finally {
      await session.endSession()
      console.log('db session for user deletion complete')
    }
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
 