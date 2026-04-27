import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { StorageService } from 'src/storage/storage.service';

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
  constructor(
    private readonly eventsService: EventsService,
    private readonly storageService: StorageService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('coverImage', { storage: memoryStorage() }))
  async create(@Req() req, @Body() createEventDto: CreateEventDto, @UploadedFile() coverImage?: Express.Multer.File) {
    createEventDto.churchId = req.user.church._id;
    if (coverImage) {
      const churchId = req.user.church._id;
      const optimizedBuffer = await sharp(coverImage.buffer)
        .resize(1200, 630, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const key = `events/${churchId}/cover-${Date.now()}.webp`;
      const url = await this.storageService.uploadFile(optimizedBuffer, key, 'image/webp');
      (createEventDto as any).coverImageUrl = url;
    }
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
  @UseInterceptors(FileInterceptor('coverImage', { storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() coverImage?: Express.Multer.File,
    @Req() req?: any,
  ) {
    if (coverImage) {
      const churchId = req.user.church._id;
      const optimizedBuffer = await sharp(coverImage.buffer)
        .resize(1200, 630, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const key = `events/${churchId}/cover-${Date.now()}.webp`;
      const url = await this.storageService.uploadFile(optimizedBuffer, key, 'image/webp');
      (updateEventDto as any).coverImageUrl = url;
    }
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param() deleteEventDto: DeleteEventDto) {
    console.log("HOW ARE YOU ")
    return this.eventsService.remove(deleteEventDto.id);
  }
}
