import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Church } from 'src/schemas/Church.schema';
import { Request } from 'express';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
interface User {
  _id: string;
  userName: string;
  password: string;
  roles: string[];
  __v: number;
}

interface ChurchInterface {
  _id: string;
  churchName: string;
  phone: string;
  email: string;
  __v: number;
}

interface UserInfo {
  user: User;
  church: ChurchInterface;
}

@UseGuards(AuthenticatedGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    console.log(createAttendanceDto);
    return this.attendanceService.create(createAttendanceDto)
  }

  // @Get()
  // findAll(@Body() body: { date: string }, @Req() req: Request) {
  //   // console.log('hello')
  //   const churchId = (req.user as any).church._id; 
  //   return this.attendanceService.findAll(churchId, body.date);
  // }

  @Get(':date')
  findOne(@Param('date') date: string, @Req() req: Request) {
    const churchId = (req.user as any).church._id;
    return this.attendanceService.findOne(churchId, date);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
