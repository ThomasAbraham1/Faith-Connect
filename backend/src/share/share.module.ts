import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ShareController],
})
export class ShareModule {}
