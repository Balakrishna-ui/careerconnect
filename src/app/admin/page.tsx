"use client";

import { KPICard } from "@/components/admin/KPICard";
import { ADMIN_KPI, REVENUE_TREND, USER_GROWTH_TREND, VERIFICATION_STATUS_PIE, ADMIN_SESSIONS, ADMIN_JOB_SEEKERS, ADMIN_PAYMENTS } from "@/lib/admin-mock-data";
import { Users, GraduationCap, ShieldCheck, DollarSign, Activity, CalendarDays, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users" value={ADMIN_KPI.totalUsers} icon={Users} trend={ADMIN_KPI.userGrowth} />
        <KPICard title="Total Mentors" value={ADMIN_KPI.totalMentors} icon={GraduationCap} />
        <KPICard title="Total Job Seekers" value={ADMIN_KPI.totalJobSeekers} icon={Users} />
        <KPICard title="Verified Mentors" value={ADMIN_KPI.verifiedMentors} icon={ShieldCheck} />
        
        <KPICard title="Pending Verifications" value={ADMIN_KPI.pendingVerifications} icon={Activity} />
        <KPICard title="Today's Sessions" value={ADMIN_KPI.todaySessions} icon={CalendarDays} trend={ADMIN_KPI.sessionGrowth} />
        <KPICard title="Total Revenue" value={ADMIN_KPI.totalRevenue} icon={DollarSign} valuePrefix="$" trend={ADMIN_KPI.revenueGrowth} />
        <KPICard title="Monthly Revenue" value={ADMIN_KPI.monthlyRevenue} icon={DollarSign} valuePrefix="$" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={USER_GROWTH_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                  <Bar dataKey="jobSeekers" name="Job Seekers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mentors" name="Mentors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mentor Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VERIFICATION_STATUS_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {VERIFICATION_STATUS_PIE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {VERIFICATION_STATUS_PIE.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Sessions</CardTitle>
            <Link href="/admin/sessions" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {ADMIN_SESSIONS.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                      {session.jobSeekerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{session.jobSeekerName} → {session.mentorName}</p>
                      <p className="text-xs text-muted-foreground">{session.date} at {session.time} • {session.duration}m</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${session.amount}</p>
                    <StatusBadge status={session.sessionStatus} className="text-[10px] px-1.5 py-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
