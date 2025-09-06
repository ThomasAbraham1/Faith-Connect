import { Injectable } from '@nestjs/common';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Church } from 'src/schemas/Church.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChurchesService {
  constructor(@InjectModel(Church.name) private churchModel: Model<Church>) {}
  async create(createChurchDto: CreateChurchDto) {
    return await this.churchModel.insertOne(createChurchDto);
  }

  findAll() {
    return `This action returns all churches`;
  }

  async findOne(churchName: string) {
    return await this.churchModel.findOne({ churchName: churchName });
  }

  update(id: number, updateChurchDto: UpdateChurchDto) {
    return `This action updates a #${id} church`;
  }

  remove(id: number) {
    return `This action removes a #${id} church`;
  }
}
