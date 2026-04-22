import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('dashboard')
@UseGuards(AuthenticatedGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Req() req) {
    const churchId = req.user.church._id;
    return this.dashboardService.getSummaryStats(churchId);
  }

  @Get('attendance')
  async getAttendance(@Req() req) {
    const churchId = req.user.church._id;
    return this.dashboardService.getAttendanceOverview(churchId);
  }

  @Get('activity')
  async getActivity(@Req() req) {
    const churchId = req.user.church._id;
    return this.dashboardService.getRecentActivity(churchId);
  }
}
