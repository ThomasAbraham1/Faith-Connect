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
  register(@Param('id') id: string, @Body() body: Record<string, any>) {
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

    // Handle formFields if it comes as a string (multipart/form-data)
    if (typeof createEventDto.formFields === 'string') {
      try {
        createEventDto.formFields = JSON.parse(createEventDto.formFields);
      } catch (e) {
        console.error('Error parsing formFields:', e);
      }
    }

    if (coverImage) {
      const churchId = req.user.church._id;
      let finalBuffer = coverImage.buffer;
      let finalMimeType = coverImage.mimetype;

      // Only optimize if file is large (> 200KB)
      if (coverImage.size > 200000) {
        finalBuffer = await sharp(coverImage.buffer)
          .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer();
        finalMimeType = 'image/webp';
      }

      const ext = finalMimeType.split('/')[1];
      const key = `events/${churchId}/cover-${Date.now()}.${ext}`;
      const url = await this.storageService.uploadFile(finalBuffer, key, finalMimeType);
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
    // Handle formFields if it comes as a string (multipart/form-data)
    if (typeof updateEventDto.formFields === 'string') {
      try {
        updateEventDto.formFields = JSON.parse(updateEventDto.formFields);
      } catch (e) {
        console.error('Error parsing formFields:', e);
      }
    }

    if (coverImage) {
      const churchId = req.user.church._id;
      let finalBuffer = coverImage.buffer;
      let finalMimeType = coverImage.mimetype;

      // Only optimize if file is large (> 200KB)
      if (coverImage.size > 200000) {
        finalBuffer = await sharp(coverImage.buffer)
          .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer();
        finalMimeType = 'image/webp';
      }

      const ext = finalMimeType.split('/')[1];
      const key = `events/${churchId}/cover-${Date.now()}.${ext}`;
      const url = await this.storageService.uploadFile(finalBuffer, key, finalMimeType);
      (updateEventDto as any).coverImageUrl = url;
    }
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param() deleteEventDto: DeleteEventDto) {
    console.log("HOW ARE YOU ")
    return this.eventsService.remove(deleteEventDto.id);
  }

  @Delete(':id/registrations/:regId')
  removeRegistration(@Param('id') eventId: string, @Param('regId') regId: string) {
    return this.eventsService.removeRegistration(eventId, regId);
  }

  @Patch(':id/registrations/:regId/mark-paid')
  markRegistrationAsPaid(@Param('id') eventId: string, @Param('regId') regId: string) {
    return this.eventsService.markRegistrationAsPaid(eventId, regId);
  }

  @Patch(':id/registrations/:regId/mark-unpaid')
  markRegistrationAsUnpaid(@Param('id') eventId: string, @Param('regId') regId: string) {
    return this.eventsService.markRegistrationAsUnpaid(eventId, regId);
  }
}
