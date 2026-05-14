import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { User } from 'src/schemas/User.schema';
import { Registration } from 'src/schemas/Registration.schema';
import { Model, Types } from 'mongoose';
import { Church } from 'src/schemas/Church.schema';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name) private readonly eventsModel: Model<Events>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Registration.name) private readonly registrationModel: Model<Registration>,
    @InjectModel(Church.name) private readonly churchModel: Model<Church>,
    private readonly paymentService: PaymentService,
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

    // Determine if this is a paid event
    const registrationFee = parseFloat(event.registrationFee || '0');
    const isPaidEvent = registrationFee > 0;

    // 2. Check for duplicate registration by phone number for this event (only if PAID or FREE)
    const existingRegistration = await this.registrationModel.findOne({
      eventId: new Types.ObjectId(eventId),
      'responses.phone': phone,
      paymentStatus: { $in: ['PAID', 'FREE'] }
    });

    if (existingRegistration) {
      throw new Error('A registration with this phone number already exists for this event');
    }

    // Cleanup: If the user has abandoned (PENDING) or FAILED attempts, remove them so we don't clutter the database
    if (isPaidEvent) {
      await this.registrationModel.deleteMany({
        eventId: new Types.ObjectId(eventId),
        'responses.phone': phone,
        paymentStatus: { $in: ['PENDING', 'FAILED'] }
      });
    }

    // 3. Create the registration entry (Initially as PENDING or FREE)
    const registration = await this.registrationModel.create({
      eventId: new Types.ObjectId(eventId),
      churchId: new Types.ObjectId(event.churchId),
      source: 'PUBLIC_FORM',
      responses,
      paymentStatus: isPaidEvent ? 'PENDING' : 'FREE',
    });

    // 4. If Paid, generate the Razorpay Order
    if (isPaidEvent) {
      try {
        const { order, razorpayKeyId } = await this.paymentService.createOrder(
          event.churchId.toString(),
          registrationFee,
          registration._id.toString()
        );

        // Update the registration with the order ID we just got
        registration.razorpayOrderId = order.id;
        await registration.save();

        return { 
          success: true, 
          requiresPayment: true, 
          order, 
          razorpayKeyId, 
          registrationId: registration._id 
        };
      } catch (error) {
        // If order creation fails, clean up the registration so they can try again
        await this.registrationModel.findByIdAndDelete(registration._id);
        throw error;
      }
    }

    return { success: true, requiresPayment: false, registrationId: registration._id };
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

  /** Admin: delete a registration */
  async removeRegistration(eventId: string, regId: string) {
    const result = await this.registrationModel.findByIdAndDelete(regId);
    if (!result) throw new NotFoundException('Registration not found');
    return { success: true, message: 'Registration deleted successfully' };
  }

  /** Admin: mark a pending/failed registration as PAID manually */
  async markRegistrationAsPaid(eventId: string, regId: string) {
    const result = await this.registrationModel.findByIdAndUpdate(
      regId,
      { paymentStatus: 'PAID' },
      { new: true }
    );
    if (!result) throw new NotFoundException('Registration not found');
    return { success: true, message: 'Registration marked as paid manually' };
  }

  /** Admin: mark a paid registration as PENDING manually */
  async markRegistrationAsUnpaid(eventId: string, regId: string) {
    const result = await this.registrationModel.findByIdAndUpdate(
      regId,
      { paymentStatus: 'PENDING' },
      { new: true }
    );
    if (!result) throw new NotFoundException('Registration not found');
    return { success: true, message: 'Registration marked as unpaid manually' };
  }
}
