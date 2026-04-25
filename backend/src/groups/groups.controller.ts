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
  Query,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateGroupParticipantsDto } from './dto/update-group-participants.dto';

@UseGuards(AuthenticatedGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Req() req, @Body() createGroupDto: CreateGroupDto) {
    const churchId = req.user.church._id;
    createGroupDto.churchId = churchId;
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll(@Req() req, @Query('category') category?: string) {
    const churchId = req.user.church._id;
    return this.groupsService.findAll(churchId, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Patch(':id/participants')
  updateParticipants(
    @Param('id') id: string,
    @Body() updateParticipantsDto: UpdateGroupParticipantsDto,
  ) {
    return this.groupsService.updateParticipants(id, updateParticipantsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
