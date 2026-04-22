import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('reminders')
@UseGuards(AuthenticatedGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('today-stats')
  async getTodayStats(@Req() req) {
    const churchId = req.user.church._id;
    return this.remindersService.getTodayStats(churchId);
  }
}
