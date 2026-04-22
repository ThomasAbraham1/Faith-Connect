import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { Church } from './entities/church.entity';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@UseGuards(AuthenticatedGuard)
@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) { }

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
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'public', 'uploads'),
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const extension = file.originalname.split('.').pop();
          cb(null, `${randomName}.${extension}`);
        },
      }),
    }),
  )
  updateMyChurch(@Req() req, @Body() updateChurchDto: UpdateChurchDto, @UploadedFile() logo) {
    const churchId = req.user.church._id;
    if (logo) {
      updateChurchDto.logo = logo.filename;
    }
    return this.churchesService.update(churchId, updateChurchDto);
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
