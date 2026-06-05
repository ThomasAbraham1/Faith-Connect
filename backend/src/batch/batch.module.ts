import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchSchema } from '../schemas/Batch.schema';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
