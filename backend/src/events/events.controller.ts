import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

// --- PUBLIC routes (no auth) ---
@Controller('events/public')
export class EventsPublicController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':id')
  findPublic(@Param('id') id: string) {
    return this.eventsService.findPublic(id);
  }

  @Post(':id/register')
  register(@Param('id') id: string, @Body() body: { firstName: string; lastName: string; email: string; phone: string }) {
    return this.eventsService.registerForEvent(id, body);
  }
}

// --- PRIVATE routes (auth required) ---
@Controller('events')
@UseGuards(AuthenticatedGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  create(@Req() req, @Body() createEventDto) {
    createEventDto.churchId = req.user.church._id
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(@Req() req) {
    const churchId = req.user.church._id;
    return this.eventsService.findAll(churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/registrations')
  getRegistrations(@Param('id') id: string) {
    return this.eventsService.getRegistrations(id);
  }

  @Post(':id/registrations')
  addRegistration(@Req() req, @Param('id') id: string, @Body() body: { memberId: string }) {
    return this.eventsService.addRegistration(id, body.memberId, req.user.church._id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param() deleteEventDto: DeleteEventDto) {
    console.log("HOW ARE YOU ")
    return this.eventsService.remove(deleteEventDto.id);
  }
}
