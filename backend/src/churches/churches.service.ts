import { Injectable } from '@nestjs/common';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Church } from 'src/schemas/Church.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChurchesService {
  constructor(@InjectModel(Church.name) private churchModel: Model<Church>) { }
  async create(createChurchDto: CreateChurchDto, session?) {
    const result = await this.churchModel.insertOne(createChurchDto, { session });
    return result
  }

  findAll() {
    return `This action returns all churches`;
  }

  async findOne(churchName: string) {
    const result = await this.churchModel.findOne({ churchName: churchName });
    return result
  }

  update(id: number, updateChurchDto: UpdateChurchDto) {
    return `This action updates a #${id} church`;
  }

  async remove(id: string) {
    try {
      return await this.churchModel.deleteOne({
        _id: id
      })
    } catch (error) {
      throw error
    }
  }
}
