import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from 'src/schemas/Group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateGroupParticipantsDto } from './dto/update-group-participants.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupDocument> {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  async findAll(churchId: string, category?: string): Promise<GroupDocument[]> {
    const query: any = { churchId };
    if (category) {
      query.category = category;
    }
    return this.groupModel.find(query).exec();
  }

  async findOne(id: string): Promise<GroupDocument> {
    const group = await this.groupModel
      .findById(id)
      .populate('leaders')
      .populate('members')
      .exec();
    
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<GroupDocument> {
    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .exec();

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return updatedGroup;
  }

  async updateParticipants(id: string, updateParticipantsDto: UpdateGroupParticipantsDto): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    const { addMembers, removeMembers, addLeaders, removeLeaders } = updateParticipantsDto;

    const updateOps: any = {};

    // Handle Members
    if (addMembers?.length) {
      updateOps.$addToSet = { ...updateOps.$addToSet, members: { $each: addMembers } };
    }
    if (removeMembers?.length) {
      updateOps.$pull = { ...updateOps.$pull, members: { $in: removeMembers } };
    }

    // Handle Leaders
    if (addLeaders?.length) {
      updateOps.$addToSet = { ...updateOps.$addToSet, leaders: { $each: addLeaders } };
    }
    if (removeLeaders?.length) {
      updateOps.$pull = { ...updateOps.$pull, leaders: { $in: removeLeaders } };
    }

    if (Object.keys(updateOps).length > 0) {
      await this.groupModel.findByIdAndUpdate(id, updateOps);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<any> {
    const result = await this.groupModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return result;
  }
}
