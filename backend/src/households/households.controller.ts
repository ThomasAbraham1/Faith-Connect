import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdMembersDto } from './dto/update-household.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('households')
@UseGuards(AuthenticatedGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateHouseholdDto) {
    dto.churchId = req.user.church._id;
    return this.householdsService.create(dto);
  }

  @Get()
  findAll(@Req() req, @Query('memberId') memberId?: string) {
    if (memberId) {
      return this.householdsService.findByMemberId(memberId);
    }
    return this.householdsService.findAll(req.user.church._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.householdsService.findOne(id);
  }

  @Patch(':id/members')
  updateMembers(@Param('id') id: string, @Body() dto: UpdateHouseholdMembersDto) {
    return this.householdsService.updateMembers(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.householdsService.remove(id);
  }
}
