"use client";

import { Card } from "@/components/ui/card";

interface HeroHeaderProps {
  mentorName: string;
  newBookingCount: number;
  rescheduleCount: number;
  todaySessionsCount: number;
  vacationMode?: boolean;
  mentorUserId?: string;
  onMutate?: () => void;
}

import { useState } from "react";
import { toggleVacationMode } from "@/actions/mentor-dashboard-actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Palmtree } from "lucide-react";

export function HeroHeader({ mentorName, newBookingCount, rescheduleCount, todaySessionsCount, vacationMode = false, mentorUserId, onMutate }: HeroHeaderProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (!mentorUserId) return;
    setIsToggling(true);
    const res = await toggleVacationMode(mentorUserId, checked);
    setIsToggling(false);
    if (res.success && onMutate) {
      onMutate();
    } else if (!res.success) {
      alert(res.error || "Failed to toggle vacation mode");
    }
  };
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
      <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur px-4 py-2 rounded-xl border border-border">
          <Palmtree className={`w-5 h-5 ${vacationMode ? "text-orange-500" : "text-muted-foreground"}`} />
          <Label htmlFor="vacation-mode" className="font-semibold cursor-pointer">Vacation Mode</Label>
          <div className="ml-2 flex items-center">
            {isToggling ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <Switch 
                id="vacation-mode" 
                checked={vacationMode} 
                onCheckedChange={handleToggle}
              />
            )}
          </div>
        </div>
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
