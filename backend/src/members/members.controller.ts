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
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { StorageService } from 'src/storage/storage.service';
import { join } from 'path';
import { SignatureDto } from './dto/signature.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';

@UseGuards(AuthenticatedGuard)
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly storageService: StorageService,
  ) { }

  @UseInterceptors(...[
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 }, // Allow one file for profilePic
      { name: 'signature', maxCount: 1 }, // Allow one file for signature
    ], {
      storage: memoryStorage(),
    }),
  ]
  )
  @Post()
  async create(
    @Req() req,
    @UploadedFiles() uploadedFiles,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    const churchId = req.user.church._id;
    createMemberDto.churchId = churchId;

    if (uploadedFiles.profilePic) {
      try {
        const file = uploadedFiles.profilePic[0];
        const optimizedBuffer = await sharp(file.buffer)
          .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `members/${churchId}/profile-${Date.now()}.webp`;
        const url = await this.storageService.uploadFile(optimizedBuffer, key, 'image/webp');
        
        createMemberDto.profilePic = {
          profilePicPath: url,
          profilePicName: url.split('/').pop() || '',
        };
      } catch (err) {
        console.error('Profile pic processing failed:', err);
      }
    }

    if (uploadedFiles.signature) {
      try {
        const file = uploadedFiles.signature[0];
        const key = `members/${churchId}/signature-${Date.now()}-${file.originalname}`;
        const url = await this.storageService.uploadFile(file.buffer, key, file.mimetype);
        
        createMemberDto.signature = {
          signaturePicName: url.split('/').pop() || '',
          signaturePicPath: url
        }
      } catch (err) {
        console.error('Signature upload failed:', err);
      }
    }

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
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 }, // Allow one file for profilePic
      { name: 'signature', maxCount: 1 }, // Allow one file for signature
    ], {
      storage: memoryStorage(),
    }),
  )
  async update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @UploadedFiles() uploadedFiles, @Req() req) {
    const churchId = req.user.church._id;
    const existingMember = await this.membersService.findOne(id);
    if (!existingMember) throw new NotFoundException('Member not found');

    if (uploadedFiles?.profilePic) {
      try {
        const file = uploadedFiles.profilePic[0];
        const optimizedBuffer = await sharp(file.buffer)
          .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `members/${churchId}/profile-${Date.now()}.webp`;
        const url = await this.storageService.uploadFile(optimizedBuffer, key, 'image/webp');

        // Cleanup old profile pic if it was on S3
        if (existingMember?.profilePic?.profilePicPath?.startsWith('https://')) {
          try {
            await this.storageService.deleteFile(existingMember.profilePic.profilePicPath);
          } catch (e) {
            console.error('Failed to delete old profile pic:', e);
          }
        }
        
        updateMemberDto.profilePic = {
          profilePicPath: url,
          profilePicName: url.split('/').pop() || '',
        };
      } catch (err) {
        console.error('Profile pic update failed:', err);
      }
    }

    if (uploadedFiles?.signature) {
      try {
        const file = uploadedFiles.signature[0];
        const key = `members/${churchId}/signature-${Date.now()}-${file.originalname}`;
        const url = await this.storageService.uploadFile(file.buffer, key, file.mimetype);

        // Cleanup old signature if it was on S3
        if (existingMember?.signature?.signaturePicPath?.startsWith('https://')) {
          try {
            await this.storageService.deleteFile(existingMember.signature.signaturePicPath);
          } catch (e) {
            console.error('Failed to delete old signature:', e);
          }
        }
        
        updateMemberDto.signature = {
          signaturePicName: url.split('/').pop() || '',
          signaturePicPath: url
        }
      } catch (err) {
        console.error('Signature update failed:', err);
      }
    }

    return this.membersService.update(id, updateMemberDto, req.user);
  }

  @Delete(':id')
  remove(@Param() deleteMemberDto: DeleteMemberDto) {
    console.log(deleteMemberDto)
    return this.membersService.remove(deleteMemberDto.id);
  }

  // Signature post
  @Post('settings/signature')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: memoryStorage(),
    }),
  )
  async createSignature(@Body() createSignatureDto, @UploadedFile() signature, @Req() req) {
    const userId = createSignatureDto?.userId;
    const churchId = req.user.church._id;

    if (signature) {
      try {
        const key = `members/${churchId}/signature-settings-${Date.now()}-${signature.originalname}`;
        const url = await this.storageService.uploadFile(signature.buffer, key, signature.mimetype);

        // Find existing signature for cleanup
        const existingMember = await this.membersService.findSignature(userId);
        if (existingMember?.signature?.signaturePicPath?.startsWith('https://')) {
          try {
            await this.storageService.deleteFile(existingMember.signature.signaturePicPath);
          } catch (e) {
            console.error('Failed to delete old signature:', e);
          }
        }

        const signatureInfo: SignatureDto = {
          signaturePicName: url.split('/').pop() || '',
          signaturePicPath: url
        }
        return this.membersService.createSignature(signatureInfo, userId);
      } catch (err) {
        console.error('Signature upload failed:', err);
        throw err;
      }
    }
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
