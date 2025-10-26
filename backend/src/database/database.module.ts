// database.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from 'src/schemas/Attendance.schema';
import { Church, ChurchSchema } from 'src/schemas/Church.schema';
import { Events, EventsSchema } from 'src/schemas/Events.schema';
import { Otp, otpSchema } from 'src/schemas/Otp.schema';
import { Role, RoleSchema } from 'src/schemas/Role.schema';
import { Twofa, TwofaSchema } from 'src/schemas/Twofa.schema';
import { User, userSchema } from 'src/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Otp.name, schema: otpSchema },
      { name: Twofa.name, schema: TwofaSchema },
      { name: Church.name, schema: ChurchSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Events.name, schema: EventsSchema },
    ]),
  ],
  exports: [MongooseModule], // This module now exports all configured models
})
export class DatabaseModule { }
