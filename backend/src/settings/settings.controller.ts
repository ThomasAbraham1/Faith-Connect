import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(+id, updateSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }

  // Signature 

  @Post('signature')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'public', 'uploads'),
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${file.originalname}.png`);
        },
      }),
    }),
  )
  createSignature(@Body() createSettingDto: CreateSettingDto) {
    console.log(__dirname, join(__dirname, '..', '..', 'public', 'uploads'))
    // return this.settingsService.createSignature(createSettingDto);
  }
}
