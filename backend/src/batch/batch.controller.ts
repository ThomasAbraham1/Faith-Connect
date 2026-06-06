import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { BatchType } from '../schemas/Batch.schema';

@UseGuards(AuthenticatedGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  create(
    @Req() req,
    @Body() data: { name?: string; type?: BatchType; eventId?: string },
  ) {
    const churchId = req.user.church._id;
    return this.batchService.create(churchId, data);
  }

  @Get()
  findAll(@Req() req) {
    const churchId = req.user.church._id;
    return this.batchService.findAll(churchId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const churchId = req.user.church._id;
    return this.batchService.findOne(churchId, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() data: { name?: string; type?: BatchType; eventId?: string },
  ) {
    const churchId = req.user.church._id;
    return this.batchService.update(churchId, id, data);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const churchId = req.user.church._id;
    return this.batchService.remove(churchId, id);
  }
}
