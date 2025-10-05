import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from 'src/schemas/Attendance.schema';

@Injectable()
export class AttendanceService {
  constructor(@InjectModel(Attendance.name) private AttendanceModel: Model<Attendance>) {
  }
  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      const churchId = createAttendanceDto.churchId;
      const date = createAttendanceDto.date
      return await this.AttendanceModel.findOneAndUpdate({ churchId: churchId, date: date }, createAttendanceDto, {
        upsert: true, new: true
      });
    } catch (error) {
      console.log(error);
      return error
    }
  }

  async findAll(churchId: string, date: string) {
    try {
      console.log("HELLO")
      const result = await this.AttendanceModel.findOne({
        churchId: churchId, date: date
      });
      return result ? result : []
    } catch (error) {
      console.log(error);
      return error
    }
  }

  async findOne(churchId: string, date: string) {
    try {
      const result = await this.AttendanceModel.findOne({
        churchId: churchId, date: date
      });
      return result ? result : []

    } catch (error) {
      console.log(error);
      return error
    }
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}
