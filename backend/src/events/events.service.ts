import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { User } from 'src/schemas/User.schema';
import { Registration } from 'src/schemas/Registration.schema';
import { Model, Types } from 'mongoose';
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
    const church = await this.churchModel.findById(event.churchId).select('churchName logo').lean();
    return { ...event, churchName: church?.churchName, churchLogo: church?.logo };
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.eventsModel.findByIdAndUpdate(id, updateEventDto, { new: true });
  }

  remove(id: string | string[]) {
    console.log('hi')
    return this.eventsModel.deleteMany({ _id: { $in: id } });
  }

  /** Public registration — stores responses, checks for duplicate phone */
  async registerForEvent(eventId: string, responses: Record<string, any>) {
    const event = await this.eventsModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');
    if (!event.registrationOpen) throw new Error('Registration is closed');

    // 1. Validate fixed mandatory fields
    const { name, phone } = responses;
    if (!name || !phone) {
      throw new Error('Name and Phone are required');
    }

    // 2. Check for duplicate registration by phone number for this event
    const existingRegistration = await this.registrationModel.findOne({
      eventId: new Types.ObjectId(eventId),
      'responses.phone': phone,
    });

    if (existingRegistration) {
      throw new Error('A registration with this phone number already exists for this event');
    }

    // 3. Create the registration entry
    const registration = await this.registrationModel.create({
      eventId: new Types.ObjectId(eventId),
      churchId: new Types.ObjectId(event.churchId),
      source: 'PUBLIC_FORM',
      responses,
    });

    return { success: true, registrationId: registration._id };
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
    const member = await this.userModel.findById(memberId);
    if (!member) throw new NotFoundException('Member not found');

    // Store member info in responses for consistency with public registrations
    const responses = {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
    };

    return this.registrationModel.findOneAndUpdate(
      { eventId: new Types.ObjectId(eventId), 'responses.phone': member.phone },
      { 
        eventId: new Types.ObjectId(eventId), 
        churchId: new Types.ObjectId(churchId), 
        source: 'ADMIN_ADDED',
        responses 
      },
      { upsert: true, new: true },
    );
  }
}
