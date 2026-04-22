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
import { TemplatesService } from './templates.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@UseGuards(AuthenticatedGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) { }

  @Post()
  create(@Req() req, @Body() data: { name: string; subject: string; body: string }) {
    const churchId = req.user.church._id;
    const userId = req.user._id;
    return this.templatesService.create(churchId, userId, data);
  } 

  @Get()
  findAll(@Req() req) {
    const churchId = req.user.church._id;
    return this.templatesService.findAll(churchId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const churchId = req.user.church._id;
    return this.templatesService.findOne(churchId, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() data: { name?: string; subject?: string; body?: string },
  ) {
    const churchId = req.user.church._id;
    return this.templatesService.update(churchId, id, data);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const churchId = req.user.church._id;
    return this.templatesService.remove(churchId, id);
  }
}
