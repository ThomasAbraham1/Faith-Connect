import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Batch } from '../schemas/Batch.schema';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel(Batch.name) private readonly batchModel: Model<Batch>,
  ) {}

  async create(churchId: string, data: { name?: string; type?: string; eventId?: string }) {
    const batch = new this.batchModel({
      ...data,
      churchId,
    });
    return await batch.save();
  }

  async findAll(churchId: string) {
    return await this.batchModel.find({ churchId }).sort({ createdAt: -1 });
  }

  async findOne(churchId: string, id: string) {
    const batch = await this.batchModel.findOne({ _id: id, churchId });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  async update(churchId: string, id: string, data: Partial<Batch>) {
    const batch = await this.batchModel.findOneAndUpdate(
      { _id: id, churchId },
      { $set: data },
      { new: true },
    );
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  async remove(churchId: string, id: string) {
    const result = await this.batchModel.deleteOne({ _id: id, churchId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Batch not found');
    }
    return { message: 'Batch deleted successfully' };
  }
}
