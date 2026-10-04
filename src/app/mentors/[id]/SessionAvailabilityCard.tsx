"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyScheduleItem {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SessionAvailabilityCardProps {
  mentorId: string;
  weeklySchedules?: WeeklyScheduleItem[];
  sessionDuration?: number;
}

const DAYS = [
  { label: "Mon", dow: 1 },
  { label: "Tue", dow: 2 },
  { label: "Wed", dow: 3 },
  { label: "Thu", dow: 4 },
  { label: "Fri", dow: 5 },
  { label: "Sat", dow: 6 },
  { label: "Sun", dow: 0 },
];

function formatTime12(time24: string) {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

export function SessionAvailabilityCard({
  mentorId,
  weeklySchedules = [],
  sessionDuration = 60,
}: SessionAvailabilityCardProps) {
  // Determine available days from schedules
  const scheduleMap = useMemo(() => {
    const map = new Map<number, WeeklyScheduleItem>();
    weeklySchedules.forEach((ws) => {
      map.set(ws.dayOfWeek, ws);
    });
    return map;
  }, [weeklySchedules]);

  // Initial selected day: first day that isAvailable, default to Friday or Monday
  const initialDow = useMemo(() => {
    const found = DAYS.find((d) => {
      const sched = scheduleMap.get(d.dow);
      return sched ? sched.isAvailable : d.dow >= 1 && d.dow <= 5;
    });
    return found ? found.dow : 5; // Default to Friday
  }, [scheduleMap]);

  const [selectedDow, setSelectedDow] = useState<number>(initialDow);

  // Generate slots for the selected day
  const slots = useMemo(() => {
    const sched = scheduleMap.get(selectedDow);
    const isAvail = sched ? sched.isAvailable : selectedDow >= 1 && selectedDow <= 5;

    if (!isAvail) return [];

    const startH = sched ? parseInt(sched.startTime.split(":")[0], 10) : 9;
    const endH = sched ? parseInt(sched.endTime.split(":")[0], 10) : 18;
    const safeEndH = endH <= startH ? startH + 8 : endH;

    const slotList: string[] = [];
    let currentMin = startH * 60;
    const endMin = safeEndH * 60;
    const step = 90; // 90 min intervals matching reference: 09:00, 10:30, 12:00, 02:00, 04:00, 06:00, 08:00

    while (currentMin + sessionDuration <= endMin && slotList.length < 8) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      slotList.push(
        formatTime12(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
      );
      currentMin += step;
    }

    if (slotList.length === 0) {
      return ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];
    }

    return slotList;
  }, [selectedDow, scheduleMap, sessionDuration]);

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-foreground">Session Availability</h3>
        </div>
        <Link
          href={`/mentors/${mentorId}/book`}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group transition-colors"
        >
          View Calendar
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Availability Status Badge */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Available for Sessions
      </div>

      {/* Days Tabs */}
      <div className="grid grid-cols-7 gap-1.5 p-1 bg-muted/40 rounded-xl mb-5">
        {DAYS.map((d) => {
          const sched = scheduleMap.get(d.dow);
          const isAvail = sched ? sched.isAvailable : d.dow >= 1 && d.dow <= 5;
          const isSelected = selectedDow === d.dow;

          return (
            <button
              key={d.dow}
              type="button"
              onClick={() => setSelectedDow(d.dow)}
              className={cn(
                "py-2 text-xs font-semibold rounded-lg transition-all text-center",
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : isAvail
                  ? "text-foreground/80 hover:bg-background/80 hover:text-foreground"
                  : "text-muted-foreground/40 hover:bg-background/40 cursor-default"
              )}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Slots Grid */}
      {slots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
          {slots.map((slot, idx) => (
            <Link
              key={idx}
              href={`/mentors/${mentorId}/book`}
              className="py-2.5 px-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-blue-50/70 hover:border-blue-300 dark:hover:bg-blue-950/30 dark:hover:border-blue-800 text-center text-xs font-medium text-foreground/85 transition-all shadow-2xs"
            >
              {slot}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
          No slots available for this day
        </div>
      )}
    </div>
  );
}
