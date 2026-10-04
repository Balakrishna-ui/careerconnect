"use client";

import useSWR from "swr";
import { getMentorDashboardRealtime } from "@/actions/realtime-actions";
import { acceptBooking, rejectBooking } from "@/actions/mentor-booking-actions";
import { acceptRescheduleRequest, rejectRescheduleRequest } from "@/actions/reschedule-actions";
import { approveCancellationAction, rejectCancellationAction } from "@/actions/cancellation-actions";
import {
  Loader2, Calendar, Clock, Video, ArrowRight, Check, X,
  Link as LinkIcon, Star, Pencil, RefreshCw, XCircle,
  ChevronRight, ChevronLeft, CheckCircle2, Activity,
  Hourglass, FileText, User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CompleteSessionModal } from "@/components/mentor/dashboard/CompleteSessionModal";
import { toggleVacationMode } from "@/actions/mentor-dashboard-actions";
import { useMentorProfile } from "@/contexts/MentorProfileContext";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";

// ─── SVG Donut for Today's Summary ──────────────────────────────────────────
function DonutChart({ newRequests, rescheduled, sessions, completed }: {
  newRequests: number; rescheduled: number; sessions: number; completed: number;
}) {
  const rawTotal = newRequests + rescheduled + sessions + completed;
  const total = rawTotal || 1;
  const size = 110;
  const sw = 14;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: newRequests, color: "#F97316" }, // orange-500
    { value: rescheduled, color: "#3B82F6" }, // blue-500
    { value: sessions, color: "#8B5CF6" },    // purple-500
    { value: completed, color: "#10B981" },   // emerald-500
  ];

  let off = 0;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
        {segments.map((seg, idx) => {
          if (seg.value === 0) return null;
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={idx}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-off}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          );
          off += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900 dark:text-foreground leading-none">{rawTotal}</span>
        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Total</span>
      </div>
    </div>
  );
}

// ─── White Earnings Line Chart on Orange Gradient ───────────────────────────
function EarningsHeroChart({ earningsThisMonth }: { earningsThisMonth: number }) {
  const data = [
    { day: "1 Sep", amount: 0 },
    { day: "7 Sep", amount: 0 },
    { day: "14 Sep", amount: Math.round(earningsThisMonth * 0.3) },
    { day: "21 Sep", amount: Math.round(earningsThisMonth * 0.6) },
    { day: "30 Sep", amount: earningsThisMonth },
  ];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.25)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.85)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.85)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", fontSize: 11, borderRadius: 8 }}
          formatter={(v: any) => [`₹${v}`, "Earnings"]}
        />
        <Line type="monotone" dataKey="amount" stroke="#ffffff" strokeWidth={2.5} dot={{ r: 3.5, fill: "#ffffff" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function MentorDashboardClient({
  mentorUserId, mentorId, mentorName, initialData, reviews = [],
}: {
  mentorUserId: string; mentorId: string; mentorName: string; initialData: any; reviews?: any[];
}) {
  const [sessionToComplete, setSessionToComplete] = useState<{ id: string; name: string } | null>(null);
  const [activeAction, setActiveAction] = useState<{ id: string; type: "ACCEPT" | "REJECT"; name: string } | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingInstructions, setMeetingInstructions] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rescheduleActionId, setRescheduleActionId] = useState<string | null>(null);
  const [cancellationActionId, setCancellationActionId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, mutate } = useSWR(
    `mentor-dashboard-${mentorUserId}`,
    () => getMentorDashboardRealtime(mentorUserId),
    { fallbackData: initialData, refreshInterval: 5000 }
  );

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`mentor-${mentorId}`);
    channel.bind("new-booking", () => { toast.success("New booking request!"); mutate(); });
    channel.bind("cancellation-request", () => { toast.info("New cancellation request received!"); mutate(); });
    return () => pusher.unsubscribe(`mentor-${mentorId}`);
  }, [mentorId, mutate]);

  const {
    pendingBookings = [], confirmedBookings = [], todaysSessions = [],
    pendingReschedules = [], pendingCancellations = [], earnings, notifications = [], vacationMode,
  } = data || initialData || {};

  // Date helpers
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startOfSel = new Date(selectedDate); startOfSel.setHours(0, 0, 0, 0);
  const endOfSel = new Date(startOfSel); endOfSel.setDate(endOfSel.getDate() + 1);
  const displayedSessions = (confirmedBookings || []).filter((b: any) => {
    const d = new Date(b.date); return d >= startOfSel && d < endOfSel && b.rescheduleReq?.status !== "PENDING" && b.cancellationReq?.status !== "PENDING";
  });
  const isToday = startOfSel.getTime() === today.getTime();
  const adjustDate = (days: number) => { const d = new Date(selectedDate); d.setDate(d.getDate() + days); setSelectedDate(d); };

  // Greeting
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = mentorName.split(" ")[0];

  const completedCount = (confirmedBookings || []).filter((b: any) => b.status === "COMPLETED").length;

  // Profile Data
  const { mentorData, completionScore } = useMentorProfile();
  const profMentor = mentorData || initialData || {};
  const profName = profMentor?.user?.name || profMentor?.name || mentorName;
  const profHeadline = profMentor?.headline || "Software Developer";
  const profAvatarUrl = profMentor?.image || profMentor?.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
  const profResponseRate = 98;
  const profRating = 5.0;

  // Accept/Reject regular new booking
  const handleAction = async () => {
    if (!activeAction) return;
    setIsActionLoading(true);
    if (activeAction.type === "ACCEPT" && !meetingLink) { setIsActionLoading(false); return; }
    const res = activeAction.type === "ACCEPT"
      ? await acceptBooking(activeAction.id, meetingLink, meetingInstructions)
      : await rejectBooking(activeAction.id);
    setIsActionLoading(false);
    if (res.success) {
      toast.success(activeAction.type === "ACCEPT" ? "Booking accepted!" : "Booking rejected.");
      setActiveAction(null); setMeetingLink(""); setMeetingInstructions(""); mutate();
    } else { toast.error("Action failed."); }
  };

  // Accept/Reject Reschedule Request
  const handleAcceptReschedule = async (requestId: string) => {
    setRescheduleActionId(requestId);
    const res = await acceptRescheduleRequest(requestId);
    setRescheduleActionId(null);
    if (res.success) {
      toast.success("Reschedule request approved! Session time updated.");
      mutate();
    } else {
      toast.error(res.error || "Failed to approve reschedule.");
    }
  };

  const handleRejectReschedule = async (requestId: string) => {
    setRescheduleActionId(requestId);
    const res = await rejectRescheduleRequest(requestId);
    setRescheduleActionId(null);
    if (res.success) {
      toast.success("Reschedule request declined. Original session preserved.");
      mutate();
    } else {
      toast.error(res.error || "Failed to decline reschedule.");
    }
  };

  // Approve/Reject Cancellation Request
  const handleApproveCancellation = async (requestId: string) => {
    setCancellationActionId(requestId);
    const res = await approveCancellationAction(requestId);
    setCancellationActionId(null);
    if (res.success) {
      toast.success(res.message || "Cancellation approved! Slot is now open.");
      mutate();
    } else {
      toast.error(res.error || "Failed to approve cancellation.");
    }
  };

  const handleRejectCancellation = async (requestId: string) => {
    setCancellationActionId(requestId);
    const res = await rejectCancellationAction(requestId);
    setCancellationActionId(null);
    if (res.success) {
      toast.success("Cancellation declined. Session remains active.");
      mutate();
    } else {
      toast.error(res.error || "Failed to decline cancellation.");
    }
  };

  const fmtTime = (t: any) => new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  const fmtDate = (d: any) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

  const displayReviews = reviews && reviews.length > 0 ? reviews : [
    {
      id: "sample-1",
      user: { name: "Sudheer", image: null },
      rating: 5,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      comment: `${firstName} explained concepts very clearly and gave practical advice. Really helpful session!`
    }
  ];

  return (
    <div className="space-y-6 pb-8 font-sans w-full">
      {/* Vacation Banner */}
      {vacationMode && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3.5 rounded-2xl flex items-center justify-between text-sm shadow-2xs">
          <span><strong>Vacation Mode Active 🌴</strong> — You are currently hidden from search listings.</span>
          <button onClick={async () => { await toggleVacationMode(mentorUserId, false); mutate(); }}
            className="text-xs font-bold px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl transition-colors">
            Deactivate
          </button>
        </div>
      )}

      {/* ── Two-column Main Dashboard Grid: Central Work Area + Right Sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">

        {/* ─── CENTRAL AREA (xl:col-span-8 or 9) ─── */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-6 min-w-0">

          {/* Header Row: Greeting + Live Date Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-foreground tracking-tight flex items-center gap-2">
                {greeting}, {firstName}! <span className="text-2xl">👋</span>
              </h1>
              <p className="text-gray-500 dark:text-muted-foreground text-sm font-medium mt-0.5">
                Here&apos;s what&apos;s happening with your mentoring today.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-card border border-gray-100 dark:border-border px-3.5 py-1.5 rounded-xl shadow-2xs text-xs font-semibold text-gray-700 dark:text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{format(new Date(), "EEE, MMM d, yyyy")}</span>
            </div>
          </div>

          {/* ─── 4 Top KPI Cards ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. New Requests */}
            <div className="bg-white dark:bg-card border border-gray-100/90 dark:border-border rounded-2xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[118px]">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <Link href="/mentor/bookings" className="w-6 h-6 rounded-full bg-orange-50/60 dark:bg-orange-950/30 text-orange-500 hover:bg-orange-100 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">New Requests</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-foreground leading-tight tracking-tight">
                    {pendingBookings.length}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Today</span>
                </div>
              </div>
            </div>

            {/* 2. Rescheduled */}
            <div className="bg-white dark:bg-card border border-gray-100/90 dark:border-border rounded-2xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[118px]">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <Link href="/mentor/bookings" className="w-6 h-6 rounded-full bg-blue-50/60 dark:bg-blue-950/30 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">Rescheduled</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-foreground leading-tight tracking-tight">
                    {pendingReschedules.length}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Today</span>
                </div>
              </div>
            </div>

            {/* 3. Sessions */}
            <div className="bg-white dark:bg-card border border-gray-100/90 dark:border-border rounded-2xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[118px]">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
                  <Video className="w-4.5 h-4.5" />
                </div>
                <Link href="/mentor/bookings" className="w-6 h-6 rounded-full bg-purple-50/60 dark:bg-purple-950/30 text-purple-500 hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">Sessions</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-foreground leading-tight tracking-tight">
                    {todaysSessions.length}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Today</span>
                </div>
              </div>
            </div>

            {/* 4. Completed */}
            <div className="bg-white dark:bg-card border border-gray-100/90 dark:border-border rounded-2xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[118px]">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">Completed</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-foreground leading-tight tracking-tight">
                    {completedCount}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Reschedule Requests Alert if Any */}
          {pendingReschedules.length > 0 && (
            <div className="bg-white dark:bg-card rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/50">
                <h2 className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  Pending Reschedule Requests
                  <span className="bg-amber-200/70 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingReschedules.length}
                  </span>
                </h2>
                <Link href="/mentor/bookings" className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5">
                  View in Bookings <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-amber-100/60 dark:divide-amber-900/30">
                {pendingReschedules.map((req: any) => {
                  const menteeName = req.booking?.user?.name || "Mentee";
                  const initials = menteeName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  const isProcessing = rescheduleActionId === req.id;

                  return (
                    <div key={req.id} className="p-5 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                            {req.booking?.user?.image ? (
                              <Image src={req.booking.user.image} alt={menteeName} fill className="object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                              {menteeName}
                              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Reschedule Request
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">{req.booking?.sessionTitle || "1:1 Mentorship"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleRejectReschedule(req.id)}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleAcceptReschedule(req.id)}
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Approve
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Scheduled Time</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                            {req.oldStartTime ? new Date(req.oldStartTime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" }) : fmtDate(req.booking?.date)} at {req.oldStartTime ? fmtTime(req.oldStartTime) : fmtTime(req.booking?.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Requested New Time</p>
                          <p className="font-bold text-amber-900 dark:text-amber-300 mt-0.5">
                            {new Date(req.requestedTime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })} at {fmtTime(req.requestedTime)}
                          </p>
                        </div>
                      </div>
                      {req.reason && (
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">Reason from Mentee: </span>
                          <span className="italic">&ldquo;{req.reason}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Cancellation Requests Alert if Any */}
          {pendingCancellations.length > 0 && (
            <div className="bg-white dark:bg-card rounded-2xl border border-red-200 dark:border-red-900/60 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-red-50/60 dark:bg-red-950/20 border-b border-red-200/60 dark:border-red-900/50">
                <h2 className="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Pending Cancellation Requests
                  <span className="bg-red-200/70 dark:bg-red-900 text-red-800 dark:text-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingCancellations.length}
                  </span>
                </h2>
                <Link href="/mentor/bookings" className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-0.5">
                  View in Bookings <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-red-100/60 dark:divide-red-900/30">
                {pendingCancellations.map((req: any) => {
                  const menteeName = req.booking?.user?.name || "Mentee";
                  const initials = menteeName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  const isProcessing = cancellationActionId === req.id;
                  const start = new Date(req.booking?.startTime);

                  return (
                    <div key={req.id} className="p-5 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                            {req.booking?.user?.image ? (
                              <Image src={req.booking.user.image} alt={menteeName} fill className="object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                              {menteeName}
                              <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Cancellation Request
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">{req.booking?.sessionTitle || "1:1 Mentorship"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleRejectCancellation(req.id)}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleApproveCancellation(req.id)}
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Approve Cancellation
                          </button>
                        </div>
                      </div>

                      <div className="bg-red-50/40 dark:bg-red-950/10 p-3 rounded-xl border border-red-100 dark:border-red-900/40 text-xs">
                        <p className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Scheduled Session Details</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                          {format(start, "PPP 'at' p")} • Price: ₹{req.booking?.price || 0} {req.refundAmount > 0 ? `(Refund to mentee: ₹${req.refundAmount})` : "(Non-refundable)"}
                        </p>
                      </div>
                      {req.reason && (
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">Reason from Mentee: </span>
                          <span className="italic">&ldquo;{req.reason}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Middle Grid: Recent Booking Requests + Today's Schedule ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Recent Booking Requests */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-border/60">
                <h2 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#FF6B2B]" />
                  Recent Booking Requests
                </h2>
                <Link href="/mentor/bookings" className="text-xs font-bold text-[#FF6B2B] hover:underline flex items-center gap-0.5">
                  View all <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-center">
                {pendingBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-muted/40 flex items-center justify-center mb-3">
                      <div className="relative">
                        <Calendar className="w-7 h-7 text-gray-300" />
                        <span className="absolute -bottom-1 -right-1 bg-white dark:bg-card rounded-full p-0.5 shadow-2xs">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-800 dark:text-foreground">No pending booking requests at the moment.</p>
                    <p className="text-[11px] text-gray-400 dark:text-muted-foreground mt-1 max-w-[260px]">
                      You&apos;ll see new session requests here when job seekers book your services.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-border/40">
                    {pendingBookings.slice(0, 3).map((booking: any) => {
                      const initials = (booking.user?.name || "??").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <div key={booking.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                                {booking.user?.image ? <Image src={booking.user.image} alt={booking.user.name} fill className="object-cover" /> : initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-foreground text-sm truncate">{booking.user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{booking.sessionTitle || "1:1 Mentorship"}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#FF6B2B] shrink-0">₹{booking.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                            <span className="text-[11px] text-gray-400">{fmtDate(booking.date)} at {fmtTime(booking.startTime)}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setActiveAction({ id: booking.id, type: "REJECT", name: booking.user?.name || "Mentee" })}
                                className="px-3 py-1 text-xs font-bold rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Reject</button>
                              <button onClick={() => setActiveAction({ id: booking.id, type: "ACCEPT", name: booking.user?.name || "Mentee" })}
                                className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs">Accept</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Today's Schedule */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs flex flex-col min-w-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-border/60">
                <h2 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Today&apos;s Schedule
                </h2>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustDate(-1)} className="w-6 h-6 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => setSelectedDate(new Date())} className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 transition-colors">
                    Today
                  </button>
                  <button onClick={() => adjustDate(1)} className="w-6 h-6 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-center min-w-0">
                {displayedSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-muted/40 flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-xs font-bold text-gray-800 dark:text-foreground">
                      {isToday ? "No sessions scheduled for today." : "No sessions on this date."}
                    </p>
                    {isToday && <p className="text-[11px] text-gray-400 mt-1">Enjoy your free time! 🎉</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedSessions.map((session: any) => {
                      const menteeInitial = (session.user?.name || "R").charAt(0).toUpperCase();
                      const startTimeDisplay = fmtTime(session.startTime);
                      const endTimeDisplay = fmtTime(session.endTime);

                      return (
                        <div
                          key={session.id}
                          className="bg-[#FAFAFA] dark:bg-muted/30 border border-gray-100 dark:border-border rounded-2xl p-3.5 flex items-center justify-between gap-3 min-w-0"
                        >
                          {/* Left: Time box + User / Mentee info + Session + Status */}
                          <div className="flex flex-col gap-2 min-w-0 flex-1">
                            {/* Upper: Time Accent + Avatar + Name + Session Title */}
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Orange-bordered time accent box */}
                              <div className="border-l-3 border-[#FF6B2B] pl-2.5 py-0.5 shrink-0">
                                <p className="text-sm font-black text-gray-900 dark:text-foreground leading-tight">{startTimeDisplay.split(" ")[0]}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{startTimeDisplay.split(" ")[1]}</p>
                              </div>

                              {/* Mentee Avatar + Details */}
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                                  {session.user?.image ? (
                                    <Image src={session.user.image} alt={session.user.name} fill className="object-cover" />
                                  ) : (
                                    menteeInitial
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 dark:text-foreground text-sm leading-tight truncate">{session.user?.name || "ramu"}</p>
                                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                    <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                                    <span className="truncate">{session.sessionTitle || "Career Guidance"}</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Lower: Session Time Range + Status Badge */}
                            <div className="flex items-center gap-2.5 text-xs pl-0.5">
                              <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                {startTimeDisplay} – {endTimeDisplay}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                                Confirmed
                              </span>
                            </div>
                          </div>

                          {/* Right: Stacked Action Buttons (Start Meeting & Complete) */}
                          <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                            <button
                              onClick={() => {
                                if (!session.meetingLink || session.meetingLink === "Pending Mentor Approval") {
                                  alert("Meeting link is not available for this session.");
                                  return;
                                }
                                if (session.status !== "CONFIRMED") {
                                  alert("Meeting is not available until the booking is confirmed.");
                                  return;
                                }
                                window.open(`/api/meetings/${session.id}/join`, "_blank", "noopener,noreferrer");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <Video className="w-3.5 h-3.5 shrink-0" />
                              Start Meeting
                            </button>
                            <button
                              onClick={() => setSessionToComplete({ id: session.id, name: session.user?.name || "" })}
                              className="px-3.5 py-1.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap text-center"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ─── Wide Earnings Overview Card ─── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-border/60">
              <h2 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2B]" />
                Earnings Overview
              </h2>
              <span className="text-xs font-semibold text-gray-600 dark:text-muted-foreground bg-gray-50 dark:bg-muted border border-gray-200/60 dark:border-border px-3 py-1 rounded-xl">
                This Month ▾
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Upper Orange Gradient Banner */}
              <div className="bg-gradient-to-r from-[#FF6B2B] to-[#FF8A4C] rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
                <div className="shrink-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-base font-bold">₹</span>
                    </div>
                    <span className="text-xs font-medium text-orange-100">Total Earnings</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    ₹{(earnings?.earningsThisMonth || 0).toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-orange-100 font-medium">+0% from last month</p>
                </div>

                {/* Integrated Line Chart */}
                <div className="flex-1 max-w-lg w-full">
                  <EarningsHeroChart earningsThisMonth={earnings?.earningsThisMonth || 0} />
                </div>
              </div>

              {/* Lower Row of 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Today */}
                <div className="bg-[#FBFBFC] dark:bg-muted/30 border border-gray-100 dark:border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Today</p>
                    <p className="text-base font-black text-gray-900 dark:text-foreground">₹{(earnings?.earningsToday || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* This Week */}
                <div className="bg-[#FBFBFC] dark:bg-muted/30 border border-gray-100 dark:border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">This Week</p>
                    <p className="text-base font-black text-gray-900 dark:text-foreground">₹{(earnings?.earningsThisWeek || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* This Month */}
                <div className="bg-[#FBFBFC] dark:bg-muted/30 border border-gray-100 dark:border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">This Month</p>
                    <p className="text-base font-black text-gray-900 dark:text-foreground">₹{(earnings?.earningsThisMonth || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Pending Payout */}
                <div className="bg-[#FBFBFC] dark:bg-muted/30 border border-gray-100 dark:border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Hourglass className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Pending Payout</p>
                    <p className="text-base font-black text-[#FF6B2B]">₹{(earnings?.pendingPayout || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {/* View Full Earnings Report Link */}
              <div className="pt-2 text-center border-t border-gray-50 dark:border-border/60">
                <Link
                  href="/mentor/earnings"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Full Earnings Report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Bottom Row: Today's Summary + Top Reviews ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Today's Summary with Donut Chart */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border p-5 shadow-2xs">
              <h2 className="font-bold text-gray-900 dark:text-foreground text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Today&apos;s Summary
              </h2>
              <div className="flex items-center gap-6">
                <DonutChart
                  newRequests={pendingBookings.length}
                  rescheduled={pendingReschedules.length}
                  sessions={todaysSessions.length}
                  completed={completedCount}
                />
                <div className="space-y-2.5 flex-1">
                  {[
                    { label: "New Requests", value: pendingBookings.length, color: "bg-orange-500" },
                    { label: "Rescheduled", value: pendingReschedules.length, color: "bg-blue-500" },
                    { label: "Sessions", value: todaysSessions.length, color: "bg-purple-500" },
                    { label: "Completed", value: completedCount, color: "bg-emerald-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-gray-500 dark:text-muted-foreground font-medium">{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Top Reviews */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#FF6B2B]" />
                    Top Reviews
                  </h2>
                  <Link href="/mentor/reviews" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                    View all <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                {displayReviews.slice(0, 1).map((rev: any) => (
                  <div key={rev.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-foreground text-sm">{rev.user?.name || "Sudheer"}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">2 months ago</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-muted-foreground leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ─── RIGHT PANEL (xl:col-span-4 or 3) ─── */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-6 shrink-0">

          {/* 1. Mentor Profile Card */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs overflow-hidden text-center">
            {/* Peach Top Header Banner */}
            <div className="bg-gradient-to-b from-[#FFF0E6] dark:from-orange-950/20 to-white dark:to-card pt-6 pb-2 px-5 flex flex-col items-center">
              {/* Profile Image with Pencil Edit Icon */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                  <Image src={profAvatarUrl} alt={profName} fill className="object-cover" />
                </div>
                <Link
                  href="/mentor/profile"
                  className="absolute -top-1 -right-1 bg-white dark:bg-card border border-gray-200 dark:border-border p-1.5 rounded-full shadow-2xs text-[#FF6B2B] hover:bg-orange-50 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </Link>
              </div>

              {/* Mentor Name + Green Verified Checkmark */}
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-extrabold text-gray-900 dark:text-foreground text-base tracking-tight">{profName}</h3>
                <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white shrink-0" />
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{profHeadline}</p>

              {/* View Profile Button */}
              <Link href="/mentor/profile" className="w-full mt-3.5 mb-2">
                <button className="w-full py-2 px-4 rounded-xl border border-orange-200 dark:border-orange-800 text-[#FF6B2B] hover:bg-orange-50 dark:hover:bg-orange-950/30 text-xs font-bold transition-all shadow-2xs cursor-pointer">
                  View Profile
                </button>
              </Link>
            </div>

            {/* Performance Stats */}
            <div className="p-5 pt-3 space-y-3.5 text-left border-t border-gray-50 dark:border-border/60">
              {/* Profile Completion Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-gray-600 dark:text-muted-foreground">Profile Completion</span>
                  <span className="text-[#FF6B2B] font-bold">{completionScore || 65}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-blue-600 h-full rounded-l-full" style={{ width: `${Math.min(completionScore || 65, 50)}%` }} />
                  <div className="bg-[#FF6B2B] h-full rounded-r-full" style={{ width: `${Math.max(0, (completionScore || 65) - 50)}%` }} />
                </div>
              </div>

              {/* Response Rate */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-gray-600 dark:text-muted-foreground">Response Rate</span>
                <span className="text-emerald-500 font-bold">{profResponseRate}%</span>
              </div>

              {/* Avg Rating */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-muted-foreground">Avg Rating</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 dark:text-foreground font-bold">{profRating.toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* Total Views with Sparkline */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-muted-foreground">Total Views</span>
                <div className="w-20 h-6">
                  <svg viewBox="0 0 100 30" className="w-full h-full text-[#FF6B2B] stroke-current stroke-2 fill-none overflow-visible">
                    <path d="M 0,25 Q 15,10 30,20 T 60,5 T 90,15 T 100,8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Earnings Summary */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs p-5">
            <h2 className="font-bold text-gray-900 dark:text-foreground text-sm mb-3.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              Earnings Summary
            </h2>
            <div className="space-y-3">
              {[
                { label: "Today", value: `₹${(earnings?.earningsToday || 0).toLocaleString("en-IN")}` },
                { label: "This Week", value: `₹${(earnings?.earningsThisWeek || 0).toLocaleString("en-IN")}` },
                { label: "This Month", value: `₹${(earnings?.earningsThisMonth || 0).toLocaleString("en-IN")}` },
                { label: "Pending Payout", value: `₹${(earnings?.pendingPayout || 0).toLocaleString("en-IN")}`, accent: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-500 dark:text-muted-foreground">{item.label}</span>
                  <span className={`font-bold ${item.accent ? "text-[#FF6B2B] text-sm" : "text-gray-900 dark:text-foreground"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/mentor/earnings"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors border-t border-gray-50 dark:border-border/60"
            >
              View Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 3. Recent Activity */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100/90 dark:border-border shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-bold text-gray-900 dark:text-foreground text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Recent Activity
              </h2>
              <Link href="/mentor/bookings" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                ...notifications.slice(0, 3),
                ...pendingBookings.slice(0, 3).map((b: any) => ({
                  id: `pb-${b.id}`,
                  type: "BOOKING",
                  description: `You have a new session request from ${b.user?.name || "Mentee"}.`,
                  time: fmtDate(b.date),
                })),
                ...pendingCancellations.slice(0, 2).map((c: any) => ({
                  id: `can-${c.id}`,
                  type: "CANCELLATION",
                  description: `${c.booking?.user?.name || "Mentee"} has requested to cancel their session scheduled for ${fmtDate(c.booking?.date)} at ${fmtTime(c.booking?.startTime)}.`,
                  time: fmtDate(c.createdAt),
                }))
              ].slice(0, 4).map((item: any, idx: number) => {
                const isCancel = item.type === "CANCELLATION" || item.description?.includes("cancel");

                return (
                  <div key={item.id || idx} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCancel ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      }`}>
                      {isCancel ? <FileText className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-foreground leading-snug font-medium line-clamp-2">
                        {item.description || item.message || "New booking request"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.time || "Recently"}</p>
                    </div>
                  </div>
                );
              })}

              {notifications.length === 0 && pendingBookings.length === 0 && pendingCancellations.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── Dialogs: Preserve All Existing Action Functionality ── */}
      <Dialog open={activeAction?.type === "ACCEPT"} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accept Session with {activeAction?.name}</DialogTitle>
            <DialogDescription>Provide a meeting link for this session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link">Meeting Link</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="link" placeholder="https://meet.google.com/..." className="pl-9" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} disabled={isActionLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Pre-session Instructions (Optional)</Label>
              <Input id="instructions" placeholder="Please review notes before we meet..." value={meetingInstructions} onChange={(e) => setMeetingInstructions(e.target.value)} disabled={isActionLoading} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={isActionLoading}>Cancel</Button>
            <Button onClick={handleAction} disabled={!meetingLink || isActionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />} Confirm & Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction?.type === "REJECT"} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Session</DialogTitle>
            <DialogDescription>Are you sure you want to reject {activeAction?.name}&apos;s session?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={isActionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleAction} disabled={isActionLoading}>
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />} Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CompleteSessionModal
        isOpen={!!sessionToComplete}
        onClose={() => setSessionToComplete(null)}
        bookingId={sessionToComplete?.id || null}
        patientName={sessionToComplete?.name || ""}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
