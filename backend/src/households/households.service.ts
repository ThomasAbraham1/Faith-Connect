import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Household, HouseholdDocument } from 'src/schemas/Household.schema';
import { User } from 'src/schemas/User.schema';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdMembersDto } from './dto/update-household.dto';

@Injectable()
export class HouseholdsService {
  constructor(
    @InjectModel(Household.name) private householdModel: Model<HouseholdDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(dto: CreateHouseholdDto): Promise<HouseholdDocument> {
    const members = dto.members || [];
    // Ensure primaryContact is always in the members list
    if (!members.includes(dto.primaryContactId)) {
      members.push(dto.primaryContactId);
    }
    const household = await this.householdModel.create({ ...dto, members });

    // Update primaryContact's householdId and householdRole
    await this.userModel.findByIdAndUpdate(dto.primaryContactId, {
      householdId: household._id,
      householdRole: 'PRIMARY',
    });

    return this.findOne(household._id.toString());
  }

  async findAll(churchId: string): Promise<HouseholdDocument[]> {
    return this.householdModel
      .find({ churchId })
      .populate('primaryContactId', 'firstName lastName phone profilePic')
      .exec();
  }

  async findByMemberId(memberId: string): Promise<HouseholdDocument | null> {
    const user = await this.userModel.findById(memberId).select('householdId');
    if (!user?.householdId) return null;
    return this.findOne(user.householdId.toString());
  }

  async findOne(id: string): Promise<HouseholdDocument> {
    const household = await this.householdModel
      .findById(id)
      .populate({
        path: 'members',
        select: 'firstName lastName phone profilePic householdRole',
      })
      .populate('primaryContactId', 'firstName lastName phone profilePic')
      .exec();
    if (!household) throw new NotFoundException(`Household ${id} not found`);
    return household;
  }

  async updateMembers(id: string, dto: UpdateHouseholdMembersDto): Promise<HouseholdDocument> {
    const household = await this.householdModel.findById(id);
    if (!household) throw new NotFoundException(`Household ${id} not found`);

    const updateOps: any = {};

    if (dto.addMembers?.length) {
      updateOps.$addToSet = { members: { $each: dto.addMembers } };
      // Update each added member's householdId
      await this.userModel.updateMany(
        { _id: { $in: dto.addMembers } },
        { householdId: id },
      );
    }

    if (dto.removeMembers?.length) {
      updateOps.$pull = { members: { $in: dto.removeMembers } };
      // Clear householdId from removed members
      await this.userModel.updateMany(
        { _id: { $in: dto.removeMembers } },
        { $unset: { householdId: 1, householdRole: 1 } },
      );
    }

    if (dto.name) updateOps.$set = { ...updateOps.$set, name: dto.name };
    if (dto.primaryContactId) {
      updateOps.$set = { ...updateOps.$set, primaryContactId: dto.primaryContactId };
      // Update old primary and new primary
      await this.userModel.updateMany(
        { householdId: id, householdRole: 'PRIMARY' },
        { householdRole: 'SPOUSE' },
      );
      await this.userModel.findByIdAndUpdate(dto.primaryContactId, { householdRole: 'PRIMARY' });
    }

    if (Object.keys(updateOps).length > 0) {
      await this.householdModel.findByIdAndUpdate(id, updateOps);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<any> {
    const household = await this.householdModel.findById(id);
    if (!household) throw new NotFoundException(`Household ${id} not found`);

    // Clear household references from all members
    await this.userModel.updateMany(
      { householdId: id },
      { $unset: { householdId: 1, householdRole: 1 } },
    );

    return this.householdModel.findByIdAndDelete(id);
  }
}
