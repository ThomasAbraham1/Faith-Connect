import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { User } from 'src/schemas/User.schema';
import { Registration } from 'src/schemas/Registration.schema';
import { Model } from 'mongoose';
import { Church } from 'src/schemas/Church.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name) private readonly eventsModel: Model<Events>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Registration.name) private readonly registrationModel: Model<Registration>,
    @InjectModel(Church.name) private readonly churchModel: Model<Church>,
  ) { }

  async create(createEventDto: any) {
    return await this.eventsModel.create(createEventDto);
  }

  async findAll(churchId: string) {
    try {
      return await this.eventsModel.find({ churchId: churchId }).sort({ eventDate: -1 });
    } catch (e) {
      console.error('Error in EventsService.findAll:', e);
      throw e;
    }
  }

  async findOne(id: string) {
    return this.eventsModel.findById(id);
  }

  /** Public — no auth required */
  async findPublic(id: string) {
    const event = await this.eventsModel.findById(id).lean();
    if (!event) throw new NotFoundException('Event not found');
    const church = await this.churchModel.findById(event.churchId).select('name').lean();
    return { ...event, churchName: church?.name };
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.eventsModel.findByIdAndUpdate(id, updateEventDto, { new: true });
  }

  remove(id: string | string[]) {
    console.log('hi')
    return this.eventsModel.deleteMany({ _id: { $in: id } });
  }

  /** Public registration — upsert member, then create Registration */
  async registerForEvent(eventId: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    const event = await this.eventsModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    // 1. Find or create member
    let member = await this.userModel.findOne({
      churchId: event.churchId,
      $or: [{ email: data.email }, { phone: data.phone }],
    });

    let isNewMember = false;
    if (!member) {
      isNewMember = true;
      const userName = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}_${Date.now()}`;
      member = await this.userModel.create({
        churchId: event.churchId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        userName,
        password: Math.random().toString(36).slice(-10),
        spiritualStatus: 'SEEKER',
        roles: [],
      });
    }

    // 2. Upsert registration (ignore duplicate)
    await this.registrationModel.findOneAndUpdate(
      { eventId, memberId: member._id },
      { eventId, memberId: member._id, churchId: event.churchId, source: 'PUBLIC_FORM' },
      { upsert: true, new: true },
    );

    return { success: true, isNewMember };
  }

  /** Private — get all registrants for an event, populated with member data */
  async getRegistrations(eventId: string) {
    return this.registrationModel
      .find({ eventId })
      .populate('memberId', 'firstName lastName email phone profilePic spiritualStatus')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Admin: manually add an existing member to an event */
  async addRegistration(eventId: string, memberId: string, churchId: string) {
    return this.registrationModel.findOneAndUpdate(
      { eventId, memberId },
      { eventId, memberId, churchId, source: 'ADMIN_ADDED' },
      { upsert: true, new: true },
    );
  }
}
