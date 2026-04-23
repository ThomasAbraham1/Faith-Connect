import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { Church } from './entities/church.entity';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { StorageService } from 'src/storage/storage.service';

@UseGuards(AuthenticatedGuard)
@Controller('churches')
export class ChurchesController {
  constructor(
    private readonly churchesService: ChurchesService,
    private readonly storageService: StorageService,
  ) { }

  @Post()
  create(@Body() createChurchDto: CreateChurchDto) {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  findAll() {
    return this.churchesService.findAll();
  }

  @Get('roles')
  findAllRoles(@Req() req) {
    const church = req.user.church;
    console.log(church)
    return church.roles
    // return this.churchesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.churchesService.findOne(id);
  }

  @Patch('my-church')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
    }),
  )
  async updateMyChurch(@Req() req, @Body() updateChurchDto: UpdateChurchDto, @UploadedFile() logo) {
    const churchId = req.user.church._id;
    
    if (logo) {
      try {
        // 1. Process with sharp (Resize + WebP)
        const optimizedBuffer = await sharp(logo.buffer)
          .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        // 2. Upload to S3
        const key = `churches/${churchId}/${Date.now()}.webp`;
        const url = await this.storageService.uploadFile(optimizedBuffer, key, 'image/webp');
        console.log('Uploaded to S3:', url);

        // 3. (Optional) Cleanup old logo from S3 if it exists and is an S3 URL
        const oldChurch = await this.churchesService.findOne(req.user.church.churchName);
        if (oldChurch?.logo && oldChurch.logo.startsWith('https://')) {
          try {
            await this.storageService.deleteFile(oldChurch.logo);
          } catch (deleteError) {
            console.error('Failed to delete old logo from S3:', deleteError);
          }
        }

        updateChurchDto.logo = url;
      } catch (err) {
        console.error('Image processing or upload failed:', err);
        throw new Error('Failed to process or upload church logo. Please try again.');
      }
    }
    
    console.log('Updating church:', churchId);
    console.log('Update payload:', updateChurchDto);
    
    const result = await this.churchesService.update(churchId, updateChurchDto);
    console.log('Update result:', result);

    // Refresh the user session so /auth/me returns the latest data
    if (req.user) {
      req.user.church = result;
      await new Promise<void>((resolve, reject) => {
        req.login(req.user, (err) => {
          if (err) {
            console.error('Session refresh failed:', err);
            return reject(err);
          }
          resolve();
        });
      });
      console.log('Session refreshed successfully');
    }

    return result;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChurchDto: UpdateChurchDto) {
    return this.churchesService.update(id, updateChurchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.churchesService.remove(id);
  }
}
