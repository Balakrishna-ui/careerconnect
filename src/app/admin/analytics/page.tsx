"use client";

import { CONVERSION_FUNNEL, TOP_SEARCHED_ROLES, TOP_BOOKED_COMPANIES, USER_RETENTION } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep dive into user behavior, retention, and conversion metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
            <CardDescription>Visitor to Paid Session conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONVERSION_FUNNEL} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="stage" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#374151', opacity: 0.2 }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Retention</CardTitle>
            <CardDescription>Percentage of users active after X weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={USER_RETENTION}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                  <Line type="monotone" dataKey="retention" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Searched Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Searched Roles</CardTitle>
            <CardDescription>Most demanded expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TOP_SEARCHED_ROLES.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-medium w-4">{idx + 1}.</span>
                    <span className="font-medium text-sm">{item.role}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(item.searches / TOP_SEARCHED_ROLES[0].searches) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.searches.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Booked Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Booked Companies</CardTitle>
            <CardDescription>Mentors from these companies are most popular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TOP_BOOKED_COMPANIES.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-medium w-4">{idx + 1}.</span>
                    <span className="font-medium text-sm">{item.company}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${(item.bookings / TOP_BOOKED_COMPANIES[0].bookings) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.bookings.toLocaleString()}</span>
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
