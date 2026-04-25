import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import api from "@/api/api"
import { Users, UserPlus, TrendingUp, Calendar, ArrowUpRight, Cake, Heart, MailCheck, IndianRupee } from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: todayStats } = useQuery({
    queryKey: ['today-stats'],
    queryFn: async () => {
      const response = await api.get('/reminders/today-stats');
      return response.data;
    }
  });

  const { data: summaryStats } = useQuery({
    queryKey: ['summary-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      console.log(response)
      return response.data;
    }
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-overview'],
    queryFn: async () => {
      const response = await api.get('/dashboard/attendance');
      return response.data;
    }
  });

  const { data: activityData } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await api.get('/dashboard/activity');
      return response.data;
    }
  });

  const stats = [
    {
      title: "Total Members",
      value: summaryStats?.data?.totalMembers?.toString() || "0",
      change: "All time records",
      icon: Users,
    },
    {
      title: "New This Month",
      value: summaryStats?.data?.newMembers?.toString() || "0",
      change: "Last 30 days",
      icon: UserPlus,
      highlight: true,
    },
    {
      title: "Upcoming Events",
      value: summaryStats?.data?.activeEvents?.toString() || "0",
      change: "Next 30 days",
      icon: TrendingUp,
    },
    {
      title: "Ministry Budget Health",
      value: `₹${(summaryStats?.data?.totalSpent || 0).toLocaleString()}`,
      change: `of ₹${(summaryStats?.data?.totalAllocated || 0).toLocaleString()} allocated`,
      icon: IndianRupee,
      customContent: (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[10px] font-medium opacity-70">
            <span>{((summaryStats?.data?.totalSpent / (summaryStats?.data?.totalAllocated || 1)) * 100).toFixed(0)}% spent</span>
            <span>{summaryStats?.data?.ministryCount || 0} Ministries</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                (summaryStats?.data?.totalSpent / (summaryStats?.data?.totalAllocated || 1)) >= 1 ? 'bg-destructive' :
                (summaryStats?.data?.totalSpent / (summaryStats?.data?.totalAllocated || 1)) >= 0.8 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min((summaryStats?.data?.totalSpent / (summaryStats?.data?.totalAllocated || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
      link: "/dashboard/Groups?category=MINISTRY"
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.highlight ? "border-primary/50 bg-primary/5" : ""} ${stat.link ? "cursor-pointer hover:border-primary/30 transition-colors" : ""}`}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
              {stat.customContent}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Days Today */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-muted-foreground">Today's Special Occasions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background border-pink-100 dark:border-pink-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Birthdays Today</CardTitle>
              <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-full">
                <Cake className="h-4 w-4 text-pink-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.data?.birthdays || 0}</div>
              <p className="text-xs text-muted-foreground">Automated greetings queued</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anniversaries Today</CardTitle>
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                <Heart className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.data?.anniversaries || 0}</div>
              <p className="text-xs text-muted-foreground">Automated greetings queued</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Confirmations</CardTitle>
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                <MailCheck className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.data?.emailsSent || 0}</div>
              <p className="text-xs text-muted-foreground">Audit logs verified for today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area - Charts / Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Attendance Graph */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sunday Attendance Overview</CardTitle>
            <CardDescription>
              Service attendance (Last 10 Records).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] flex items-end justify-between gap-2 px-4 pb-2 border-b">
              {Array.isArray(attendanceData?.data) ? (
                attendanceData.data.map((item: any, i: number) => (
                  <div key={i} className="group relative flex w-full flex-col justify-end gap-2 h-full">
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${Math.min((item.count / (summaryStats?.data?.totalMembers || 1)) * 100, 100)}%` }}
                    />
                  </div>
                ))
              ) : (
                [0, 0, 0, 0].map((_, i) => <div key={i} className="w-full bg-muted/20 h-4 rounded-t-md" />)
              )}
            </div>
            <div className="mt-4 flex justify-between px-4 text-[10px] text-muted-foreground font-medium">
              {Array.isArray(attendanceData?.data) && attendanceData.data.map((item: any) => (
                <span key={item.date}>{item.date?.split('-').slice(1).join('/')}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions across the church.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2">
              {Array.isArray(activityData?.data) ? (
                activityData.data.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className={`relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full items-center justify-center border font-bold ${
                      activity.type === 'MEMBER' ? 'bg-green-100 text-green-700' :
                      activity.type === 'EMAIL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type === 'MEMBER' ? <Users className="h-4 w-4" /> :
                       activity.type === 'EMAIL' ? <MailCheck className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                    </span>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
