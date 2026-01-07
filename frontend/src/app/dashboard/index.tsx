import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, UserPlus, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"

export default function Dashboard() {
  // Hardcoded "Hollywood" Data
  const stats = [
    {
      title: "Total Members",
      value: "124",
      change: "+12% from last month",
      icon: Users,
    },
    {
      title: "New Visitors",
      value: "3",
      change: "+2 this week",
      icon: UserPlus,
      highlight: true, // Special styling for this key metric
    },
    {
      title: "Retention Rate",
      value: "95%",
      change: "+4.1% all time",
      icon: TrendingUp,
    },
    {
      title: "Avg. Attendance",
      value: "88",
      change: "Last 4 Sundays",
      icon: Calendar,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className={stat.highlight ? "border-primary/50 bg-primary/5" : ""}>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area - Charts / Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Graph Placeholder */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              Service attendance (Last 3 Months).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* 
                Fix: Ensure flex items have height. 
                Using relative height % requires parent to have explicit height.
             */}
            <div className="h-[250px] flex items-end justify-between gap-2 px-4 pb-2 border-b">
              {[45, 62, 58, 75, 80, 88, 78, 92, 85, 95, 88, 88].map((height, i) => (
                <div key={i} className="group relative flex w-full flex-col justify-end gap-2 h-full">
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between px-4 text-xs text-muted-foreground font-medium">
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Action Items */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions and follow-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Hardcoded Success Stories */}
              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-green-100 items-center justify-center border text-green-700 font-bold">
                  JD
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-sm text-muted-foreground">
                    New Visitor added.
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> Queue
                </div>
              </div>

              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Friday Youth</p>
                  <p className="text-sm text-muted-foreground">
                    Attendance Marked (32 present).
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">
                  2h ago
                </div>
              </div>

              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-yellow-100 items-center justify-center border text-yellow-700 font-bold">
                  MJ
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Michael Jordan</p>
                  <p className="text-sm text-muted-foreground">
                    Requested Prayer via SMS.
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-yellow-600">
                  Urgent
                </div>
              </div>

              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-blue-100 items-center justify-center border text-blue-700 font-bold">
                  SM
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Miller</p>
                  <p className="text-sm text-muted-foreground">
                    Marked "Absent" for 3 weeks.
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-red-500">
                  Needs Call
                </div>
              </div>

              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-purple-100 items-center justify-center border text-purple-700 font-bold">
                  🎉
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Worship Team</p>
                  <p className="text-sm text-muted-foreground">
                    Event created for tomorrow.
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">
                  5h ago
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
