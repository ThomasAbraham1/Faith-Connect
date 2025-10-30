import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Events.name) private readonly eventsModel: Model<Events>) { }
  async create(createEventDto: CreateEventDto) {
    return await this.eventsModel.insertOne(createEventDto);
  }

  findAll() {
    return this.eventsModel.find();
  }

  findOne(id: number) {
    return this.eventsModel.findById(id);
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.eventsModel.findByIdAndUpdate(id, updateEventDto, { new: true });
  }

  remove(id: number) {
    return this.eventsModel.findByIdAndDelete(id);
  }
}
