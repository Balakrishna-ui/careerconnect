"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenteeProfileDialog } from "@/components/mentor/MenteeProfileDialog";
import { MentorBookingActions } from "@/components/mentor/MentorBookingActions";
import { CompleteSessionModal } from "@/components/mentor/dashboard/CompleteSessionModal";
import { getMentorBookingsAction } from "@/actions/mentor-booking-actions";
import { acceptRescheduleRequest, rejectRescheduleRequest } from "@/actions/reschedule-actions";
import { approveCancellationAction, rejectCancellationAction } from "@/actions/cancellation-actions";
import { toast } from "sonner";

type TabType = "upcoming" | "pending" | "completed" | "cancelled" | "rescheduled" | "history";

interface MentorBookingsClientProps {
  initialBookings: any[];
}

export function MentorBookingsClient({ initialBookings }: MentorBookingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [sessionToComplete, setSessionToComplete] = useState<{ id: string; name: string } | null>(null);
  const [rescheduleActionId, setRescheduleActionId] = useState<string | null>(null);
  const [cancellationActionId, setCancellationActionId] = useState<string | null>(null);

  const { data: bookingsData, mutate } = useSWR(
    "mentor-bookings-data",
    async () => {
      try {
        const res = await getMentorBookingsAction();
        return res || [];
      } catch (err) {
        console.error("Failed to poll mentor bookings:", err);
        return initialBookings || [];
      }
    },
    {
      fallbackData: initialBookings,
      refreshInterval: 5000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const bookings = bookingsData || initialBookings;

  const handleApproveReschedule = async (requestId: string) => {
    setRescheduleActionId(requestId);
    const res = await acceptRescheduleRequest(requestId);
    setRescheduleActionId(null);
    if (res.success) {
      toast.success("Reschedule request approved! Session time updated.");
      mutate();
    } else {
      toast.error(res.error || "Failed to approve reschedule request.");
    }
  };

  const handleDeclineReschedule = async (requestId: string) => {
    setRescheduleActionId(requestId);
    const res = await rejectRescheduleRequest(requestId);
    setRescheduleActionId(null);
    if (res.success) {
      toast.success("Reschedule request declined. Original session preserved.");
      mutate();
    } else {
      toast.error(res.error || "Failed to decline reschedule request.");
    }
  };

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

  const handleDeclineCancellation = async (requestId: string) => {
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

  // Calculate Real Historical Metrics (Completed Sessions ONLY)
  const completedSessions = useMemo(
    () => bookings.filter((b: any) => b.status === "COMPLETED"),
    [bookings]
  );

  const totalEarnings = useMemo(() => {
    return completedSessions.reduce(
      (sum: number, b: any) => sum + (b.payment?.amount || b.price || 0),
      0
    );
  }, [completedSessions]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking: any) => {
      const end = new Date(booking.endTime);
      const isPast = end < now;
      const isPendingReschedule = booking.rescheduleReq?.status === "PENDING";
      const isPendingCancellation = booking.cancellationReq?.status === "PENDING";

      if (activeTab === "upcoming") {
        return booking.status === "CONFIRMED" && !isPast && !isPendingReschedule && !isPendingCancellation;
      }
      if (activeTab === "pending") {
        return booking.status === "PENDING" || isPendingReschedule || isPendingCancellation;
      }
      if (activeTab === "completed") {
        return booking.status === "COMPLETED";
      }
      if (activeTab === "cancelled") {
        return booking.status === "CANCELLED" || booking.status === "REJECTED";
      }
      if (activeTab === "rescheduled") {
        return booking.status === "RESCHEDULED" || booking.rescheduleReq?.status === "ACCEPTED" || isPendingReschedule;
      }
      if (activeTab === "history") {
        // History contains ONLY genuinely completed historical sessions
        return booking.status === "COMPLETED";
      }
      return true;
    });
  }, [bookings, activeTab]);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "rescheduled", label: "Rescheduled" },
    { id: "history", label: "History" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 font-medium">Confirmed</Badge>;
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
            Pending
          </Badge>
        );
      case "COMPLETED":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600 font-medium">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="font-medium">Cancelled</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="font-medium">Rejected</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-blue-500 font-medium">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bookings & Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Manage your upcoming sessions, pending requests, and complete session history in real time.
        </p>
      </div>

      {/* Historical Summary Stats (Displayed in History tab) */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
          <Card className="border border-border/60 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Completed Sessions
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {completedSessions.length}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Historical Bookings
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {completedSessions.length}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Completed Earnings
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  ₹{totalEarnings.toLocaleString("en-IN")}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs matching platform design */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container with clean padding and no text grid-overlap */}
      <Card className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-card overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {activeTab === "history"
              ? "Completed Session History"
              : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sessions`}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {activeTab === "history"
              ? "A complete historical archive of all completed mentoring sessions and transactions."
              : `View and manage all ${activeTab} mentoring sessions.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/75 dark:bg-muted/40 border-b border-slate-100 dark:border-slate-800">
                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="py-3.5 pl-6 pr-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Mentee</TableHead>
                  <TableHead className="py-3.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[22%]">Session</TableHead>
                  <TableHead className="py-3.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[22%]">Date & Time</TableHead>
                  <TableHead className="py-3.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[12%]">Status</TableHead>
                  <TableHead className="py-3.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[12%]">Payment</TableHead>
                  <TableHead className="py-3.5 pl-2 pr-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[17%]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                      No {activeTab} bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking: any) => {
                    const start = new Date(booking.startTime);
                    const end = new Date(booking.endTime);
                    const dateObj = new Date(booking.date);
                    const durationMins = Math.max(
                      15,
                      Math.round((end.getTime() - start.getTime()) / 60000) || 60
                    );

                    return (
                      <TableRow key={booking.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                        <TableCell className="py-4 pl-6 pr-2 font-medium align-middle">
                          <MenteeProfileDialog user={booking.user} />
                        </TableCell>
                        <TableCell className="py-4 px-3 align-middle">
                          <div className="font-semibold text-sm flex items-center gap-2 text-slate-900 dark:text-foreground">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[170px]">
                              {booking.sessionTitle || "1:1 Mentorship Session"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-3 align-middle">
                          <div className="flex items-center text-sm gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {dateObj.toLocaleDateString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {start.toLocaleTimeString("en-US", {
                              timeZone: "UTC",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            ({durationMins}m)
                          </div>
                          {booking.rescheduleReq?.status === "PENDING" && (
                            <div className="mt-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 space-y-0.5 max-w-[240px]">
                              <p className="font-semibold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                Reschedule Requested
                              </p>
                              <p className="font-medium">
                                New: {new Date(booking.rescheduleReq.requestedTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(booking.rescheduleReq.requestedTime).toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: true })}
                              </p>
                              {booking.rescheduleReq.reason && (
                                <p className="italic text-amber-700 dark:text-amber-400/90 text-[10px]">
                                  &ldquo;{booking.rescheduleReq.reason}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
                          {booking.cancellationReq?.status === "PENDING" && (
                            <div className="mt-1.5 text-[11px] text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50 space-y-0.5 max-w-[240px]">
                              <p className="font-semibold text-[10px] uppercase tracking-wider text-red-700 dark:text-red-400">
                                Cancellation Requested
                              </p>
                              {booking.cancellationReq.reason && (
                                <p className="italic text-red-700 dark:text-red-400/90 text-[10px]">
                                  &ldquo;{booking.cancellationReq.reason}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-3 align-middle">
                          {booking.rescheduleReq?.status === "PENDING" ? (
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
                              Reschedule Pending
                            </Badge>
                          ) : booking.cancellationReq?.status === "PENDING" ? (
                            <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                              Cancellation Pending
                            </Badge>
                          ) : (
                            getStatusBadge(booking.status)
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-3 align-middle">
                          <span className="font-semibold text-slate-900 dark:text-foreground text-sm">
                            ₹{booking.payment?.amount || booking.price}
                          </span>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5">
                            {booking.payment?.status || (booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? "SUCCESS" : "PENDING")}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 pl-2 pr-6 text-right align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Cancellation Pending Actions */}
                            {booking.cancellationReq?.status === "PENDING" ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  disabled={cancellationActionId === booking.cancellationReq.id}
                                  onClick={() => handleDeclineCancellation(booking.cancellationReq.id)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Decline
                                </button>
                                <button
                                  disabled={cancellationActionId === booking.cancellationReq.id}
                                  onClick={() => handleApproveCancellation(booking.cancellationReq.id)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  {cancellationActionId === booking.cancellationReq.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                  Approve Cancellation
                                </button>
                              </div>
                            ) : booking.rescheduleReq?.status === "PENDING" ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  disabled={rescheduleActionId === booking.rescheduleReq.id}
                                  onClick={() => handleDeclineReschedule(booking.rescheduleReq.id)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Decline
                                </button>
                                <button
                                  disabled={rescheduleActionId === booking.rescheduleReq.id}
                                  onClick={() => handleApproveReschedule(booking.rescheduleReq.id)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  {rescheduleActionId === booking.rescheduleReq.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                  Approve
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Upcoming Actions */}
                                {booking.status === "CONFIRMED" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (!booking.meetingLink || booking.meetingLink === "Pending Mentor Approval") {
                                          alert("Meeting link is not available yet for this session.");
                                          return;
                                        }
                                        const targetUrl = booking.meetingLink.startsWith("http://") || booking.meetingLink.startsWith("https://")
                                          ? booking.meetingLink
                                          : `https://${booking.meetingLink}`;
                                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                                      }}
                                      className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                      <Video className="w-3.5 h-3.5" /> Start Meeting
                                    </button>
                                    <button
                                      onClick={() => setSessionToComplete({ id: booking.id, name: booking.user?.name || "Mentee" })}
                                      className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors shadow-sm cursor-pointer shrink-0"
                                    >
                                      Complete
                                    </button>
                                  </>
                                )}

                                {/* Pending Actions */}
                                {booking.status === "PENDING" && (
                                  <MentorBookingActions
                                    bookingId={booking.id}
                                    patientName={booking.user?.name || "Mentee"}
                                  />
                                )}

                                {/* Details Button for non-confirmed/non-pending rows */}
                                {booking.status !== "CONFIRMED" && booking.status !== "PENDING" && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2.5 gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0" asChild>
                                    <Link href={`/dashboard/bookings/${booking.id}`}>
                                      View Details <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                                    </Link>
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Complete Session Modal */}
      {sessionToComplete && (
        <CompleteSessionModal
          bookingId={sessionToComplete.id}
          patientName={sessionToComplete.name}
          isOpen={!!sessionToComplete}
          onClose={() => setSessionToComplete(null)}
          onSuccess={() => {
            mutate();
            setSessionToComplete(null);
          }}
        />
      )}
    </div>
  );
}

