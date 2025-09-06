import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService], 
  imports:[DatabaseModule]
})
export class ChurchesModule {}
