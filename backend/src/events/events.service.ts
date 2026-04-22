import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Events.name) private readonly eventsModel: Model<Events>) { }
  async create(createEventDto: any) {
    return await this.eventsModel.create(createEventDto);
  }

  async findAll(churchId: string) {
    try {
      return await this.eventsModel.find({ churchId: churchId }).sort({ eventDate: -1 });
    } catch (e) {
      console.error("Error in EventsService.findAll:", e);
      throw e;
    }
  }

  findOne(id: number) {
    return this.eventsModel.findById(id);
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.eventsModel.findByIdAndUpdate(id, updateEventDto, { new: true });
  }

  remove(id: string | string[]) {
    // return this.eventsModel.findByIdAndDelete(id);
    // Delete the records from database
    return this.eventsModel.deleteMany({
      _id: { $in: id },
    });
  }
}
