"use client";

import React from "react";
import { format } from "date-fns";
import { Video, Calendar as CalendarIcon, Clock, Link as LinkIcon, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MeetingsPage() {
  const MEETINGS = [
    {
      id: "1",
      title: "System Design Mock Interview",
      mentor: "Sarah Jenkins",
      date: new Date(),
      startTime: "11:00 AM",
      endTime: "12:00 PM",
      status: "UPCOMING",
      link: "https://zoom.us/j/123456789"
    },
    {
      id: "2",
      title: "Resume Review",
      mentor: "Michael Chen",
      date: new Date(Date.now() - 86400000 * 2),
      startTime: "02:00 PM",
      endTime: "02:30 PM",
      status: "COMPLETED",
      link: null
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-2">Manage your upcoming mentorship sessions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <CalendarIcon className="w-4 h-4 mr-2" /> Calendar View
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white">
            Book Session
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        {MEETINGS.filter(m => m.status === "UPCOMING").map(meeting => (
          <div key={meeting.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 dark:bg-orange-950 p-3 rounded-xl shrink-0">
                <Video className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{meeting.title}</h3>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Upcoming</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {format(meeting.date, "MMMM dd, yyyy")}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {meeting.startTime} - {meeting.endTime}</span>
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {meeting.mentor}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto">Reschedule</Button>
              <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white">
                Join Meeting
              </Button>
            </div>
          </div>
        ))}

        <h2 className="text-xl font-semibold mt-10">Past Meetings</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {MEETINGS.filter(m => m.status !== "UPCOMING").map(meeting => (
            <div key={meeting.id} className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarFallback>{meeting.mentor[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{meeting.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-500">{format(meeting.date, "MMM dd, yyyy")} • {meeting.mentor}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="hidden sm:flex bg-slate-100 text-slate-600 border-slate-200">{meeting.status}</Badge>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
