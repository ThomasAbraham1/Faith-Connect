import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from 'src/schemas/Events.schema';
import { User } from 'src/schemas/User.schema';
import { Registration } from 'src/schemas/Registration.schema';
import { Model, Types } from 'mongoose';
import { Church } from 'src/schemas/Church.schema';
import { Group } from 'src/schemas/Group.schema';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectModel(Events.name) private readonly eventsModel: Model<Events>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Registration.name) private readonly registrationModel: Model<Registration>,
    @InjectModel(Church.name) private readonly churchModel: Model<Church>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    private readonly paymentService: PaymentService,
  ) { }

  async onModuleInit() {
    try {
      const legacyEvents = await this.eventsModel.find({
        $or: [
          { eventDate: { $exists: true } },
          { startTime: { $exists: true } },
          { endTime: { $exists: true } }
        ]
      }).exec();

      for (const event of legacyEvents) {
        const raw = event.toObject() as any;
        const updates: any = {};
        const unsets: any = {};

        // 1. Migrate eventDate -> startDate
        if (raw.eventDate && !raw.startDate) {
          updates.startDate = raw.eventDate;
        }
        unsets.eventDate = "";

        // 2. If startTime is present, merge it into startDate
        if (raw.startTime) {
          const startDate = updates.startDate || raw.startDate || raw.eventDate;
          if (startDate) {
            const start = new Date(startDate);
            const time = new Date(raw.startTime);
            start.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
            updates.startDate = start;
          }
          unsets.startTime = "";
        }

        // 3. If endTime is present, merge it into endDate
        if (raw.endTime) {
          const baseEnd = raw.endDate || raw.eventDate || raw.startDate || updates.startDate;
          if (baseEnd) {
            const end = new Date(baseEnd);
            const time = new Date(raw.endTime);
            end.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
            updates.endDate = end;
          }
          unsets.endTime = "";
        } else if (raw.endDate) {
          updates.endDate = raw.endDate;
        }

        if (Object.keys(updates).length > 0) {
          await this.eventsModel.findByIdAndUpdate(event._id, {
            $set: updates,
            $unset: unsets
          });
          console.log(`[Schema Migration] Migrated event "${raw.eventName}" to unified startDate/endDate.`);
        } else {
          await this.eventsModel.findByIdAndUpdate(event._id, {
            $unset: unsets
          });
        }
      }
    } catch (err) {
      console.error('[Schema Migration Error] Failed migrating events:', err);
    }
  }

  async checkConflict(churchId: string, startDate?: Date, endDate?: Date, eventId?: string) {
    if (!startDate || !endDate) return null;

    return await this.eventsModel.findOne({
      churchId,
      _id: { $ne: eventId },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    }).select('eventName startDate').lean();
  }

  async create(createEventDto: any) {
    const conflict = await this.checkConflict(
      createEventDto.churchId,
      createEventDto.startDate,
      createEventDto.endDate || createEventDto.startDate
    );

    const event = await this.eventsModel.create(createEventDto);
    return { data: event, conflict };
  }

  async findAll(churchId: string) {
    try {
      return await this.eventsModel.find({ churchId: churchId }).sort({ startDate: -1 });
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

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existing = await this.eventsModel.findById(id);
    if (!existing) throw new NotFoundException('Event not found');

    const startDate = updateEventDto.startDate || existing.startDate;
    const endDate = updateEventDto.endDate || existing.endDate || startDate;

    const conflict = await this.checkConflict(
      existing.churchId as any,
      startDate,
      endDate,
      id
    );

    const updatedEvent = await this.eventsModel.findByIdAndUpdate(id, updateEventDto, { new: true });
    return { data: updatedEvent, conflict };
  }

  remove(id: string | string[]) {
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

  /** Admin: delete registration(s) */
  async removeRegistration(eventId: string, regId: string | string[]) {
    const ids = Array.isArray(regId) ? regId : [regId];
    const result = await this.registrationModel.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Registration(s) not found');
    }

    return {
      success: true,
      message: `${result.deletedCount} registration(s) deleted successfully`
    };
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

  async getEventAttendees(eventId: string) {
    const event = await this.eventsModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    // 1. Fetch Group Members
    const groups = await this.groupModel.find({ _id: { $in: event.invitedGroups || [] } }).lean();
    const groupMemberIds = groups.flatMap(g => g.members);

    // 2. Fetch Member Profiles & Registrations
    const [groupMembers, registrations] = await Promise.all([
      this.userModel.find({ _id: { $in: groupMemberIds } }).select('firstName lastName phone email').lean(),
      this.registrationModel.find({ eventId }).lean()
    ]);

    // 3. Merge and deduplicate
    const attendeesMap = new Map();

    // Add group members first
    groupMembers.forEach(m => {
      attendeesMap.set(m._id.toString(), {
        memberId: m._id,
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
        email: m.email,
        source: 'GROUP_MEMBER'
      });
    });

    // Add or update with registration info
    registrations.forEach(reg => {
      const responses = reg.responses as any;
      // Use registration _id as unique key
      attendeesMap.set(reg._id.toString(), {
        registrationId: reg._id,
        firstName: responses?.firstName || responses?.first_name || 'Guest',
        lastName: responses?.lastName || responses?.last_name || '',
        phone: responses?.phone || 'N/A',
        email: responses?.email || '',
        source: 'REGISTRANT',
        registeredAt: reg.createdAt,
        name: responses?.name || '',
        paymentStatus: reg.paymentStatus,
        responses: reg.responses // Added for report support
      });
    });

    return Array.from(attendeesMap.values());
  }
}
