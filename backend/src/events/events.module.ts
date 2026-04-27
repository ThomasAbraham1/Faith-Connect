import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController, EventsPublicController } from './events.controller';
import { DatabaseModule } from 'src/database/database.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [EventsController, EventsPublicController],
  providers: [EventsService],
  imports: [DatabaseModule, StorageModule],
})
export class EventsModule {}
