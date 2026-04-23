import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('events')
@UseGuards(AuthenticatedGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  create(@Req() req, @Body() createEventDto) {
    createEventDto.churchId = req.user.church._id
    console.log(createEventDto)
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(@Req() req) {
    const churchId = req.user.church._id;
    return this.eventsService.findAll(churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param() deleteEventDto: DeleteEventDto) {
    console.log(deleteEventDto)
    return this.eventsService.remove(deleteEventDto.id);
  }
}
