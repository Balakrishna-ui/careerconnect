"use client";

import { HeroHeader } from "@/components/mentor/dashboard/HeroHeader";
import { BookingRequestList } from "@/components/mentor/dashboard/BookingRequestList";
import { RescheduleRequestList } from "@/components/mentor/dashboard/RescheduleRequestList";
import { TodaySessionCard } from "@/components/mentor/dashboard/TodaySessionCard";
import { EarningsOverview } from "@/components/mentor/dashboard/EarningsOverview";
import { NotificationsPanel } from "@/components/mentor/dashboard/NotificationsPanel";
import { PremiumCalendarView } from "@/components/mentor/dashboard/PremiumCalendarView";
import { AIAssistantCard } from "@/components/mentor/dashboard/AIAssistantCard";
import { CompleteSessionModal } from "@/components/mentor/dashboard/CompleteSessionModal";
import useSWR from "swr";
import { getMentorDashboardRealtime } from "@/actions/realtime-actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function MentorDashboardClient({
  mentorUserId,
  mentorName,
  initialData,
}: {
  mentorUserId: string;
  mentorName: string;
  initialData: any;
}) {
  const [sessionToComplete, setSessionToComplete] = useState<{id: string, name: string} | null>(null);

  const { data, mutate } = useSWR(
    `mentor-dashboard-${mentorUserId}`,
    () => getMentorDashboardRealtime(mentorUserId),
    {
      fallbackData: initialData,
      refreshInterval: 3000, // Poll every 3 seconds
    }
  );

  const {
    pendingBookings,
    confirmedBookings,
    todaysSessions,
    pendingReschedules,
    earnings,
    notifications,
    nextSessionTime
  } = data || initialData;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar Events
  const calendarEvents = (confirmedBookings || []).filter((b: any) => new Date(b.date) >= today).slice(0, 5).map((b: any) => {
    const bDate = new Date(b.date);
    const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][bDate.getDay()];
    return {
      id: b.id,
      day: dayName,
      time: new Date(b.startTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true }),
      title: "1:1 Mentorship",
      patientName: b.user.name
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <HeroHeader 
          mentorName={mentorName || "Mentor"}
          newBookingCount={pendingBookings?.length || 0}
          rescheduleCount={pendingReschedules?.length || 0}
          todaySessionsCount={todaysSessions?.length || 0}
        />
        {!data && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-4" />}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Content (Spans 2 cols on extra large screens) */}
        <div id="requests" className="xl:col-span-2 space-y-8">
          
          {/* New Booking Requests */}
          {(pendingBookings?.length || 0) > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                📥 New Booking Requests
              </h2>
              <BookingRequestList bookings={pendingBookings.map((b: any) => ({
                ...b,
                date: new Date(b.date),
                startTime: new Date(b.startTime),
                endTime: new Date(b.endTime),
              }))} />
            </section>
          )}

          {/* Reschedule Requests */}
          {(pendingReschedules?.length || 0) > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                🔄 Reschedule Requests
                <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full font-bold ml-1">
                  {pendingReschedules.length}
                </span>
              </h2>
              <RescheduleRequestList requests={pendingReschedules.map((r: any) => ({
                ...r,
                oldDate: new Date(r.oldDate),
                oldStartTime: new Date(r.oldStartTime),
                requestedDate: new Date(r.requestedDate),
                requestedTime: new Date(r.requestedTime),
              }))} />
            </section>
          )}

          {/* Today's Sessions */}
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              📅 Today's Sessions
            </h2>
            {(todaysSessions?.length || 0) === 0 ? (
              <div className="p-8 text-center bg-card border border-border border-dashed rounded-2xl text-muted-foreground">
                <p>No sessions scheduled for today. Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSessions.map((session: any) => (
                  <TodaySessionCard 
                    key={session.id}
                    id={session.id}
                    patientName={session.user.name}
                    serviceTitle="1:1 Mentorship Session"
                    timeStr={new Date(session.startTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })}
                    meetingLink={session.meetingLink}
                    status={session.status}
                    onMarkCompleted={(id) => setSessionToComplete({ id, name: session.user.name })}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Earnings */}
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Earnings</h2>
            <EarningsOverview 
              today={earnings?.earningsToday || 0}
              thisWeek={earnings?.earningsThisWeek || 0}
              thisMonth={earnings?.earningsThisMonth || 0}
              pendingPayout={earnings?.pendingPayout || 0}
            />
          </section>

        </div>

        {/* Right Panel / Notifications (Spans 1 col) */}
        <div className="space-y-6">
          <AIAssistantCard 
            summary={{
              bookingRequests: pendingBookings?.length || 0,
              rescheduleRequests: pendingReschedules?.length || 0,
              earningsToday: earnings?.earningsToday || 0,
              nextSessionTime: nextSessionTime
            }}
          />
          
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight mb-4">Notifications</h2>
            <NotificationsPanel notifications={notifications || []} />
          </section>
          
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight mb-4">Calendar</h2>
            <PremiumCalendarView events={calendarEvents} />
          </section>
        </div>
        
      </div>

      <CompleteSessionModal 
        isOpen={!!sessionToComplete}
        onClose={() => setSessionToComplete(null)}
        bookingId={sessionToComplete?.id || null}
        patientName={sessionToComplete?.name || ""}
        onSuccess={() => {
          mutate(); // refresh dashboard data
        }}
      />
    </div>
  );
}
