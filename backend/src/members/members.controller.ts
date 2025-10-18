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
  UploadedFiles,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { profile } from 'console';
import { join } from 'path';
import { SignatureDto } from './dto/signature.dto';

@UseGuards(AuthenticatedGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) { }

  @Post()
  @UseInterceptors(...[
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 }, // Allow one file for profilePic
      { name: 'signature', maxCount: 1 }, // Allow one file for signature
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Set destination based on file field name
          const destination =
            file.fieldname === 'profilePic'
              ? join(__dirname, '..', '..', 'public', 'uploads')
              : join(__dirname, '..', '..', 'public', 'signatures');
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          // Preserve original file extension
          const extension = file.originalname.split('.').pop();
          cb(null, `${randomName}.${extension}`);
        },
      }),
    }),
  ]
  )
  create(
    @Req() req,
    @UploadedFiles() uploadedFiles,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    console.log(createMemberDto);
    // Get church ID from session so as to insert member into correct church record
    const churchId = req.user.church._id;
    console.log(uploadedFiles);
    createMemberDto.churchId = churchId;
    if (uploadedFiles.profilePic) {
      createMemberDto.profilePic = {
        profilePicPath: uploadedFiles.profilePic[0].path,
        profilePicName: uploadedFiles.profilePic[0].filename,
      };
    }
    // Add signature file to data object
    if (uploadedFiles.signature) {
      const signature: SignatureDto = {
        signaturePicName: uploadedFiles.signature[0].filename,
        signaturePicPath: uploadedFiles.signature[0].path
      }
      createMemberDto.signature = signature
    }
    // const createMemberDtoEdited = { ...createMemberDto, churchId: churchId };
    return this.membersService.create(createMemberDto);
    // return createMemberDto
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
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 }, // Allow one file for profilePic
      { name: 'signature', maxCount: 1 }, // Allow one file for signature
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Set destination based on file field name
          const destination =
            file.fieldname === 'profilePic'
              ? join(__dirname, '..', '..', 'public', 'uploads')
              : join(__dirname, '..', '..', 'public', 'signatures');
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          // Preserve original file extension
          const extension = file.originalname.split('.').pop();
          cb(null, `${randomName}.${extension}`);
        },
      }),
    }),

  )
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @UploadedFiles() uploadedFiles, @Req() req) {
    if (uploadedFiles) {
      updateMemberDto.profilePic = {
        profilePicPath: uploadedFiles.profilePic[0].path,
        profilePicName: uploadedFiles.profilePic[0].filename,
      };
    }
    // Add signature file to data object
    if (uploadedFiles.signature) {
      const signature: SignatureDto = {
        signaturePicName: uploadedFiles.signature[0].filename,
        signaturePicPath: uploadedFiles.signature[0].path
      }
      updateMemberDto.signature = signature
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
    const userId = createSignatureDto?.userId;
    const signaturePath = signature?.path;
    const signaturePicName = signature?.filename;
    const signatureInfo: SignatureDto = {
      signaturePicName: signaturePicName,
      signaturePicPath: signaturePath
    }
    return this.membersService.createSignature(signatureInfo, userId)
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
