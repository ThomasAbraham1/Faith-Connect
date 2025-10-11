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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { profile } from 'console';
import { join } from 'path';

// @UseGuards(AuthenticatedGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePic', {
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
  create(
    @Req() req,
    @UploadedFile() profilePic,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    console.log(createMemberDto);
    // Get church ID from session so as to insert member into correct church record
    const churchId = req.user.church._id;
    console.log(profilePic);
    createMemberDto.churchId = churchId;
    if (profilePic) {
      createMemberDto.profilePic = {
        profilePicPath: profilePic.path,
        profilePicName: profilePic.filename,
      };
    }
    // const createMemberDtoEdited = { ...createMemberDto, churchId: churchId };
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll(@Req() req) {
    const churchId = req.user.church._id;
    return this.membersService.findAll(churchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profilePic', {
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
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @UploadedFile() profilePic, @Req() req) {
    if (profilePic) {
      updateMemberDto.profilePic = {
        profilePicPath: profilePic.path,
        profilePicName: profilePic.filename,
      };
    }
    return this.membersService.update(id, updateMemberDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  // Signature post
  @Post('settings/signature')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'public', 'signatures'),
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
  createSignature(@Body() createSignatureDto, @UploadedFile() signature) {
    console.log(__dirname, join(__dirname, '..', '..', 'public', 'uploads'))
    console.log(signature);
    const userId = createSignatureDto.userId;
    const signaturePath = signature?.path;
    return this.membersService.createSignature(signaturePath, userId)
    // return this.settingsService.createSignature(createSettingDto);
  }

  // find signature
  @Get('settings/signature')
  findSignature(@Req() req) {
    console.log("HELLo")
    const churchId = req.user.church._id;
    console.log(churchId)
    return this.membersService.findSignature(churchId);
  }
}
