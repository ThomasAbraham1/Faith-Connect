import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, userSchema } from 'src/schemas/User.schema';
import { Attendance, AttendanceSchema } from 'src/schemas/Attendance.schema';
import { Events, EventsSchema } from 'src/schemas/Events.schema';
import { EmailLog, EmailLogSchema } from 'src/schemas/EmailLog.schema';
import { Group, GroupSchema } from 'src/schemas/Group.schema';
import { Expense, ExpenseSchema } from 'src/schemas/Expense.schema';
import { Batch, BatchSchema } from 'src/schemas/Batch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Batch.name, schema: BatchSchema },
      { name: Events.name, schema: EventsSchema },
      { name: EmailLog.name, schema: EmailLogSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
