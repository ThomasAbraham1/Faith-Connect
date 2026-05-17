import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/schemas/User.schema';
import { Events, EventsSchema } from 'src/schemas/Events.schema';
import { Registration, RegistrationSchema } from 'src/schemas/Registration.schema';
import { EventsModule } from 'src/events/events.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Events.name, schema: EventsSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    EventsModule
  ]
})
export class ReportModule { }
