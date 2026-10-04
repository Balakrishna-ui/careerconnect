"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  RefreshCcw,
  CheckCircle,
  TrendingUp,
  UserPlus,
  FileText,
  Loader2,
  Wallet,
  ArrowDownRight,
  Megaphone,
  Bell,
  Sparkles,
} from "lucide-react";
import useSWR from "swr";
import { getJobSeekerDashboardRealtime } from "@/actions/realtime-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function JobSeekerDashboardClient({
  userId,
  firstName,
  initialData,
  needsReviewBookings,
  isPremium,
}: {
  userId: string;
  firstName: string;
  initialData: any;
  needsReviewBookings: any[];
  isPremium?: boolean;
}) {
  const [portalTab, setPortalTab] = useState<"activity" | "announce">("activity");

  const { data } = useSWR(
    `jobseeker-dashboard-${userId}`,
    () => getJobSeekerDashboardRealtime(userId),
    {
      fallbackData: initialData,
      refreshInterval: 3000,
    }
  );

  const {
    totalSessions,
    completedSessions,
    amountSpent: defaultAmountSpent,
    upcomingBookings: defaultUpcoming,
    allBookings,
  } = data || initialData;

  const today = format(new Date(), "EEEE, MMM d");

  // Available Months for Month Selector
  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, string>();
    const now = new Date();
    // Always include current month
    monthsMap.set(format(now, "yyyy-MM"), format(now, "MMMM yyyy"));

    allBookings?.forEach((b: any) => {
      const d = new Date(b.date || b.startTime);
      if (!isNaN(d.getTime())) {
        monthsMap.set(format(d, "yyyy-MM"), format(d, "MMMM yyyy"));
      }
    });

    return Array.from(monthsMap.entries()).map(([value, label]) => ({ value, label }));
  }, [allBookings]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return format(now, "yyyy-MM");
  });

  // Calculate stats for selected month from REAL booking/payment data
  const monthBookings = useMemo(() => {
    if (!allBookings) return [];
    return allBookings.filter((b: any) => {
      const d = new Date(b.date || b.startTime);
      if (isNaN(d.getTime())) return false;
      return format(d, "yyyy-MM") === selectedMonth;
    });
  }, [allBookings, selectedMonth]);

  const monthAmountSpent = useMemo(() => {
    return monthBookings
      .filter((b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "APPROVED")
      .reduce((sum: number, b: any) => sum + (b.payment?.amount || b.price || 0), 0);
  }, [monthBookings]);

  const monthUpcomingSessions = useMemo(() => {
    const now = new Date();
    return monthBookings.filter((b: any) => {
      const end = new Date(b.endTime || b.startTime || b.date);
      return (b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "APPROVED") && end >= now;
    }).length;
  }, [monthBookings]);

  const monthCanceled = useMemo(() => {
    return monthBookings.filter((b: any) => b.status === "CANCELLED" || b.status === "REJECTED" || b.status === "MISSED").length;
  }, [monthBookings]);

  // Calculate stats for Mentorship Journey
  const pendingBookings = allBookings?.filter((b: any) => b.status === "PENDING").length || 0;
  const approvedBookings = allBookings?.filter((b: any) => b.status === "APPROVED").length || 0;
  const totalMentors = new Set(allBookings?.map((b: any) => b.mentorId)).size || 0;

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome back, {firstName}
            {!data && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening with your career today.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {today}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-[#FFF9F5] dark:bg-slate-900 border border-[#FFE8D6] dark:border-slate-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome to CareerConnect 🎉</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl">
            Get started by finding your first mentor. Schedule meetings, prepare for interviews, and accelerate your career.
          </p>
          <Link href="/mentors">
            <Button className="bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-lg px-6 font-medium shadow-sm h-11">
              + Find a mentor
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Mentorship Journey Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FFF2EB] dark:bg-[#FF6B00]/20 rounded-md">
                <TargetIcon className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Mentorship Journey</h3>
            </div>
            <Link href="/dashboard/bookings" className="text-sm font-medium text-[#FF6B00] hover:text-[#E66000] flex items-center transition-colors">
              View <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <StatBox label="Pending" value={pendingBookings} icon={RefreshCcw} />
            <StatBox label="Approved" value={approvedBookings} icon={CheckCircle} />
            <StatBox label="Completed" value={completedSessions} icon={FileText} />
            <StatBox label="Total Sessions" value={totalSessions} icon={TrendingUp} />
            <StatBox label="Total Mentors" value={totalMentors} icon={UserPlus} />
          </div>
        </div>

        {/* Career Portal Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FFF2EB] dark:bg-[#FF6B00]/20 rounded-md">
                <GlobeIcon className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Career Portal</h3>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPortalTab("activity")}
                className={cn(
                  "px-4 py-1 text-sm font-medium rounded-md transition-all",
                  portalTab === "activity"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                Activity
              </button>
              <button
                onClick={() => setPortalTab("announce")}
                className={cn(
                  "px-4 py-1 text-sm font-medium rounded-md transition-all",
                  portalTab === "announce"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                Announce
              </button>
            </div>
          </div>
          
          {portalTab === "activity" ? (
            <div className="grid grid-cols-5 gap-4 animate-in fade-in duration-200">
              <StatBox label="Messages" value="0" />
              <StatBox label="Action Needed" value={needsReviewBookings.length} />
              <StatBox label="Follow-ups" value="0" />
              <StatBox label="Referrals" value="0" />
              <StatBox label="Reviews" value={needsReviewBookings.length > 0 ? needsReviewBookings.length : 0} />
            </div>
          ) : (
            <div className="space-y-3 py-1 animate-in fade-in duration-200">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] rounded-lg shrink-0 mt-0.5">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Top Mentors Live Q&A</h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">New</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                    Join this weekend&apos;s session on breaking into top tier tech companies with verified mentors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">CareerConnect 2.0 Live</h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">Update</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                    Real-time session rescheduling, shared Google Meet links, and instant roadmap generation are active!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* THIS MONTH Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">THIS MONTH</h3>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-md px-3 py-1 font-medium outline-none cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/bookings?tab=history"
            className="text-xs font-semibold text-[#FF6B00] hover:text-[#E66000] flex items-center transition-colors ml-1"
          >
            Check Previous <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Spent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium text-sm">Amount Spent</span>
          </div>
          <div className="text-[32px] font-bold text-slate-900 dark:text-white mb-2">₹{monthAmountSpent.toLocaleString("en-IN")}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Total payments this month</div>
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
            <Wallet className="w-4 h-4" />
            <span className="font-medium text-sm">Upcoming Sessions</span>
          </div>
          <div className="text-[32px] font-bold text-slate-900 dark:text-white mb-2">{monthUpcomingSessions}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Scheduled for this month</div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-400">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <span className="font-medium text-sm">Canceled</span>
          </div>
          <div className="text-[32px] font-bold text-red-500 mb-2">{monthCanceled}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Canceled or missed sessions</div>
        </div>

        {/* Money in account */}
        <div className="bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#BBF7D0] dark:border-emerald-900 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
              <span className="font-medium text-sm">Wallet Balance</span>
            </div>
            <Button className="bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-lg px-4 h-8 text-xs font-medium">
              Top up
            </Button>
          </div>
          <div className="text-[32px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 relative z-10">₹0</div>
          <div className="text-xs text-emerald-600/80 dark:text-emerald-500/80 relative z-10">Available for future bookings</div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon }: { label: string; value: number | string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 rounded-xl py-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
      {Icon && <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 mb-2" />}
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mt-1 text-center px-2">{label}</div>
    </div>
  );
}

function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
