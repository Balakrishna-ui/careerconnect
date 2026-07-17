"use client";

import { Card } from "@/components/ui/card";

interface HeroHeaderProps {
  mentorName: string;
  newBookingCount: number;
  rescheduleCount: number;
  todaySessionsCount: number;
}

export function HeroHeader({ mentorName, newBookingCount, rescheduleCount, todaySessionsCount }: HeroHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 shadow-sm mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">👋 Good Morning, {mentorName.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-2 font-medium">You have:</p>
        <div className="flex flex-wrap gap-3 mt-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {newBookingCount} New Booking Requests
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-sm font-semibold border border-amber-500/20">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {rescheduleCount} Reschedule Requests
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold border border-blue-500/20">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {todaySessionsCount} Sessions Today
          </span>
        </div>
      </div>
      <div className="mt-6 md:mt-0">
        <button 
          onClick={() => document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          View Requests
        </button>
      </div>
    </div>
  );
}
