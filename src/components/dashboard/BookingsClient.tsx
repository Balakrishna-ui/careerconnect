"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";
import { Calendar, Clock, Video, FileText, RefreshCw, Star, ArrowRight, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { getJobSeekerBookingsAction } from "@/actions/booking-actions";
import { getSessionWindow } from "@/lib/session-utils";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
import { CancellationModal } from "@/components/booking/CancellationModal";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorImage: string | null;
  mentorRole: string;
  mentorCompany: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  meetingLink: string | null;
  rescheduleReq?: {
    id: string;
    status: string;
    requestedDate: string;
    requestedTime: string;
    reason?: string | null;
  } | null;
  cancellationReq?: {
    id: string;
    status: string;
    reason?: string | null;
    refundAmount?: number | null;
  } | null;
}

interface Props {
  initialData: Booking[];
  userId?: string;
}

type TabType = "upcoming" | "pending" | "completed" | "cancelled" | "rescheduled" | "history";

export default function BookingsClient({ initialData, userId }: Props) {
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get("tab") as TabType;

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (urlTab && ["upcoming", "pending", "completed", "cancelled", "rescheduled", "history"].includes(urlTab)) {
      return urlTab;
    }
    return "upcoming";
  });

  React.useEffect(() => {
    if (urlTab && ["upcoming", "pending", "completed", "cancelled", "rescheduled", "history"].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const { data: bookingsData, mutate } = useSWR(
    userId ? `jobseeker-bookings-${userId}` : null,
    async () => {
      try {
        const res = await getJobSeekerBookingsAction(userId);
        return res || [];
      } catch (err) {
        console.error("Failed to poll bookings:", err);
        return initialData || [];
      }
    },
    {
      fallbackData: initialData,
      refreshInterval: 5000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const bookings = bookingsData || initialData;

  const completedSessions = useMemo(
    () => bookings.filter((b) => b.status === "COMPLETED"),
    [bookings]
  );

  const totalSpent = useMemo(() => {
    return bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "APPROVED")
      .reduce((sum, b) => sum + (b.price || 0), 0);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const isPast = end < now;
      const isPendingReschedule = booking.rescheduleReq?.status === "PENDING";
      const isPendingCancellation = booking.cancellationReq?.status === "PENDING";
      const isRescheduled = booking.rescheduleReq?.status === "ACCEPTED" || booking.status === "RESCHEDULED";
      const isCancelled = booking.status === "CANCELLED" || booking.status === "REJECTED";
      const isCompleted = booking.status === "COMPLETED";
      const isMissed = booking.status === "MISSED";

      if (activeTab === "upcoming") {
        return !isPast && !isCancelled && !isCompleted && !isMissed && (booking.status === "CONFIRMED" || booking.status === "APPROVED" || booking.status === "PENDING");
      }
      if (activeTab === "pending") {
        return booking.status === "PENDING" || isPendingReschedule || isPendingCancellation || isMissed;
      }
      if (activeTab === "completed") {
        return isCompleted || (isPast && (booking.status === "CONFIRMED" || booking.status === "APPROVED"));
      }
      if (activeTab === "history") {
        return true;
      }
      if (activeTab === "cancelled") {
        return isCancelled;
      }
      if (activeTab === "rescheduled") {
        return isRescheduled;
      }
      return true;
    });
  }, [bookings, activeTab]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "rescheduled", label: "Rescheduled" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Bookings</h1>
      </div>

      {/* Tabs */}
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

      {/* History Summary Cards */}
      {activeTab === "history" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completed Sessions
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {completedSessions.length}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Bookings
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {bookings.length}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold">₹</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Spent
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                ₹{totalSpent.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-20 h-20 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {activeTab === "history" ? "No booking history yet" : `No ${activeTab} bookings`}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              {activeTab === "history"
                ? "You don't have any completed sessions in your history yet."
                : `You don't have any ${activeTab} sessions at the moment.`}
            </p>
            {(activeTab === "upcoming" || activeTab === "history") && (
              <Link href="/mentors">
                <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                  {activeTab === "history" ? "Find a Mentor" : "Book a Session"}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const durationMins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000) || 60);
            const windowStatus = getSessionWindow({ startTime: start, endTime: end, status: booking.status });
            const isMissed = booking.status === "MISSED" || (booking.status === "CONFIRMED" && end < new Date());
            const isPendingReschedule = booking.rescheduleReq?.status === "PENDING";
            const isPendingCancellation = booking.cancellationReq?.status === "PENDING";

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center gap-4 lg:gap-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Mentor Info */}
                <div className="flex items-center gap-3.5 md:w-[220px] shrink-0">
                  <div className="relative h-13 w-13 rounded-full overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={booking.mentorImage || "/images/placeholders/user.png"}
                      alt={booking.mentorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{booking.mentorName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {booking.mentorRole} at {booking.mentorCompany}
                    </p>
                    <div className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      ₹{booking.price}
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 items-center min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">
                      Session
                    </div>
                    <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{booking.sessionTitle}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">
                      Date & Time
                    </div>
                    <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="whitespace-nowrap text-sm">
                        {format(start, "MMM d, yyyy")} • {format(start, "h:mm a")} ({durationMins}m)
                      </span>
                    </div>
                  </div>

                  {/* Reschedule info banner if pending */}
                  {isPendingReschedule && booking.rescheduleReq && (
                    <div className="col-span-1 sm:col-span-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Reschedule Request Pending</p>
                        <p className="mt-0.5">
                          Requested: {format(new Date(booking.rescheduleReq.requestedTime), "PPP 'at' p")}. Waiting for mentor approval.
                        </p>
                        {booking.rescheduleReq.reason && (
                          <p className="mt-1 italic text-amber-700 dark:text-amber-400/90">
                            Reason: &ldquo;{booking.rescheduleReq.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cancellation info banner if pending */}
                  {isPendingCancellation && booking.cancellationReq && (
                    <div className="col-span-1 sm:col-span-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Cancellation Request Pending</p>
                        <p className="mt-0.5">Your cancellation request has been submitted and is awaiting mentor approval.</p>
                        {booking.cancellationReq.reason && (
                          <p className="mt-1 italic text-amber-700 dark:text-amber-400/90">
                            Reason: &ldquo;{booking.cancellationReq.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Missed session notification */}
                  {isMissed && !isPendingReschedule && (
                    <div className="col-span-1 sm:col-span-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Session Missed</p>
                        <p className="mt-0.5">You can reschedule this session with {booking.mentorName} by providing a reason.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 md:justify-end shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                  {activeTab === "upcoming" && (
                    <>
                      {booking.status === "PENDING" ? (
                        <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                          Awaiting Approval
                        </Badge>
                      ) : (
                        <>
                          {isPendingReschedule ? (
                            <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                              Reschedule Pending
                            </Badge>
                          ) : isPendingCancellation ? (
                            <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                              Cancellation Pending
                            </Badge>
                          ) : (
                            <>
                              <button
                                onClick={() => setReschedulingBooking(booking)}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium shadow-sm px-4 py-2 text-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              >
                                <RefreshCw className="w-4 h-4 mr-2 text-slate-500" />
                                Reschedule
                              </button>

                              <button
                                onClick={() => setCancellingBooking(booking)}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium shadow-sm px-4 py-2 text-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              >
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Cancel Booking
                              </button>
                            </>
                          )}

                          <button
                            disabled={isPendingReschedule || isPendingCancellation}
                            onClick={() => {
                              if (isPendingReschedule || isPendingCancellation) return;
                              if (!booking.meetingLink || booking.meetingLink === "Pending Mentor Approval") {
                                alert("Meeting link is not available yet for this session.");
                                return;
                              }
                              const targetUrl = booking.meetingLink.startsWith("http://") || booking.meetingLink.startsWith("https://")
                                ? booking.meetingLink
                                : `https://${booking.meetingLink}`;
                              window.open(targetUrl, "_blank", "noopener,noreferrer");
                            }}
                            title={
                              isPendingReschedule
                                ? "Meeting cannot be joined while a reschedule request is pending mentor approval."
                                : isPendingCancellation
                                ? "Meeting cannot be joined while a cancellation request is pending."
                                : "Join Meeting"
                            }
                            className={cn(
                              "rounded-xl font-medium px-4 py-2 text-sm flex items-center justify-center transition-colors shrink-0",
                              isPendingReschedule || isPendingCancellation
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/60 dark:border-slate-700/60 shadow-none"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                            )}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {activeTab === "pending" && (
                    <>
                      {isPendingReschedule ? (
                        <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                          Reschedule Pending
                        </Badge>
                      ) : isPendingCancellation ? (
                        <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                          Cancellation Pending
                        </Badge>
                      ) : isMissed ? (
                        <button
                          onClick={() => setReschedulingBooking(booking)}
                          className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm px-4 py-2 text-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reschedule
                        </button>
                      ) : (
                        <Badge variant="secondary" className="rounded-xl px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900 font-medium">
                          Pending Approval
                        </Badge>
                      )}
                    </>
                  )}

                  {(activeTab === "completed" || activeTab === "history") && (
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20 shrink-0" />
                      Leave Review
                    </Link>
                  )}

                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <RescheduleModal
          bookingId={reschedulingBooking.id}
          mentorId={reschedulingBooking.mentorId}
          currentDate={new Date(reschedulingBooking.startTime)}
          duration={Math.max(15, Math.round((new Date(reschedulingBooking.endTime).getTime() - new Date(reschedulingBooking.startTime).getTime()) / 60000) || 60)}
          isOpen={!!reschedulingBooking}
          onClose={() => setReschedulingBooking(null)}
          onSuccess={() => {
            mutate();
            setReschedulingBooking(null);
          }}
        />
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <CancellationModal
          bookingId={cancellingBooking.id}
          mentorName={cancellingBooking.mentorName}
          sessionTitle={cancellingBooking.sessionTitle}
          startTime={cancellingBooking.startTime}
          price={cancellingBooking.price}
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onSuccess={() => {
            mutate();
            setCancellingBooking(null);
          }}
        />
      )}
    </div>
  );
}


