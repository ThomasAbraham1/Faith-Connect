import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController, EventsPublicController } from './events.controller';
import { DatabaseModule } from 'src/database/database.module';
import { StorageModule } from 'src/storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchSchema } from 'src/schemas/Batch.schema';
import { EmailLog, EmailLogSchema } from 'src/schemas/EmailLog.schema';

@Module({
  controllers: [EventsController, EventsPublicController],
  providers: [EventsService],
  imports: [DatabaseModule, StorageModule, MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]), MongooseModule.forFeature([{ name: EmailLog.name, schema: EmailLogSchema }]),],
  exports: [EventsService],
})
export class EventsModule { }
