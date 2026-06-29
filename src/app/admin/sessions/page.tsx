"use client";

import { useState } from "react";
import { ADMIN_SESSIONS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, Calendar, Clock, DollarSign, Download, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function SessionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = ADMIN_SESSIONS.filter(
    (s) =>
      s.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jobSeekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Session Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all mentoring sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, Mentor, or Job Seeker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Session ID</th>
                  <th className="px-6 py-4 font-medium">Mentor</th>
                  <th className="px-6 py-4 font-medium">Job Seeker</th>
                  <th className="px-6 py-4 font-medium">Schedule</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{session.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{session.mentorName}</div>
                      <div className="text-xs text-muted-foreground">{session.mentorCompany}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                      {session.jobSeekerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {session.time} ({session.duration}m)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium flex items-center mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        {session.amount}
                      </div>
                      <StatusBadge status={session.paymentStatus} className="text-[10px] px-1.5 py-0" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={session.sessionStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Video className="w-4 h-4 mr-2" /> Join Call
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {session.sessionStatus === "scheduled" && (
                            <>
                              <DropdownMenuItem>Reschedule Session</DropdownMenuItem>
                              <DropdownMenuItem className="text-amber-600">Cancel Session</DropdownMenuItem>
                            </>
                          )}
                          {session.paymentStatus === "success" && (
                            <DropdownMenuItem className="text-red-600">Refund Payment</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No sessions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
