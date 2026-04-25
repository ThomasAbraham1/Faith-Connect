import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Attendance } from 'src/schemas/Attendance.schema';
import { Events } from 'src/schemas/Events.schema';
import { EmailLog, EmailLogDocument } from 'src/schemas/EmailLog.schema';
import { Group, GroupDocument } from 'src/schemas/Group.schema';
import { Expense, ExpenseDocument } from 'src/schemas/Expense.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Events.name) private eventsModel: Model<Events>,
    @InjectModel(EmailLog.name) private emailLogModel: Model<EmailLogDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) { }

  async getSummaryStats(churchId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalMembers = await this.userModel.countDocuments({ churchId });
    const newMembers = await this.userModel.countDocuments({
      churchId,
      createdAt: { $gte: thirtyDaysAgo },
    });
    const upcomingEvents = await this.eventsModel.countDocuments({
      churchId,
      eventDate: { $gte: new Date() },
    });

    // Budget Aggregation
    const ministryGroups = await this.groupModel.find({ churchId, category: 'MINISTRY' });
    const totalAllocated = ministryGroups.reduce((sum, g) => sum + (g.allocatedBudget || 0), 0);
    const groupIds = ministryGroups.map(g => g._id);

    const expenseAgg = await this.expenseModel.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalSpent = expenseAgg[0]?.total || 0;

    return {
      totalMembers,
      newMembers,
      activeEvents: upcomingEvents,
      totalAllocated,
      totalSpent,
      ministryCount: ministryGroups.length,
    };
  }

  async getAttendanceOverview(churchId: string) {
    const recentAttendance = await this.attendanceModel
      .find({
        churchId,
        $or: [{ eventId: { $exists: false } }, { eventId: null }],
      })
      .sort({ date: 1 }) // Chronological
      .limit(10);

    return recentAttendance.map(a => {
      try {
        const records = typeof a.records === 'string' ? JSON.parse(a.records) : a.records;
        return {
          date: a.date,
          count: Array.isArray(records) ? records.filter(r => r && r.status === 'PRESENT').length : 0,
        };
      } catch (e) {
        return { date: a.date, count: 0 };
      }
    });
  }

  async getRecentActivity(churchId: string) {
    // 1. New Members
    const newMembers = await this.userModel
      .find({ churchId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 2. Email Logs
    const emailLogs = await this.emailLogModel
      .find({ churchId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. New Events
    const newEvents = await this.eventsModel
      .find({ churchId })
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = [
      ...newMembers.map(m => ({
        type: 'MEMBER',
        title: `${m.firstName} ${m.lastName || ''}`,
        description: `New Member joined as ${m.spiritualStatus || ''} ${m.roles}`,
        timestamp: (m as any).createdAt,
        status: m.spiritualStatus,
      })),
      ...emailLogs.map(log => ({
        type: 'EMAIL',
        title: log.subject,
        description: `Sent to ${log.recipientEmail}`,
        timestamp: (log as any).createdAt,
        status: log.status,
      })),
      ...newEvents.map(e => ({
        type: 'EVENT',
        title: e.eventName,
        description: `Event created for ${new Date(e.eventDate).toLocaleDateString()}`,
        timestamp: (e as any).createdAt,
      })),
    ];  
    console.log("Recent Activity Debug:");
    console.log("- activities:", activities); 
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }
}
