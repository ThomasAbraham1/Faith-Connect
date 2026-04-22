import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from '../schemas/template.schema';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private readonly templateModel: Model<TemplateDocument>,
  ) {}

  async create(churchId: string, createdBy: string, data: { name: string; subject: string; body: string }) {
    const template = new this.templateModel({ ...data, churchId, createdBy });
    return await template.save();
  }

  async findAll(churchId: string) {
    return await this.templateModel.find({ churchId }).sort({ createdAt: -1 });
  }

  async findOne(churchId: string, id: string) {
    const template = await this.templateModel.findOne({ _id: id, churchId });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(churchId: string, id: string, data: Partial<Template>) {
    const template = await this.templateModel.findOneAndUpdate(
      { _id: id, churchId },
      { $set: data },
      { new: true },
    );
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async remove(churchId: string, id: string) {
    const result = await this.templateModel.deleteOne({ _id: id, churchId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Template not found');
    }
    return { message: 'Template deleted successfully' };
  }
}
