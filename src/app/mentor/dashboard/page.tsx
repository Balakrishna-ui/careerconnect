// @ts-nocheck
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { HeroHeader } from "@/components/mentor/dashboard/HeroHeader";
import { BookingRequestList } from "@/components/mentor/dashboard/BookingRequestList";
import { RescheduleRequestList } from "@/components/mentor/dashboard/RescheduleRequestList";
import { TodaySessionCard } from "@/components/mentor/dashboard/TodaySessionCard";
import { EarningsOverview } from "@/components/mentor/dashboard/EarningsOverview";
import { NotificationsPanel, NotificationItem } from "@/components/mentor/dashboard/NotificationsPanel";
import { PremiumCalendarView, CalendarEvent } from "@/components/mentor/dashboard/PremiumCalendarView";
import { AIAssistantCard } from "@/components/mentor/dashboard/AIAssistantCard";

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      experiences: true,
      skills: true,
      settings: true,
      sessionTypes: true,
      socialProfiles: true,
      documents: true,
      bookings: {
        include: { user: true },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  // Calculate dates for filtering
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Group Bookings
  const confirmedBookings = mentor.bookings.filter(b => b.status === "CONFIRMED");
  const pendingBookings = mentor.bookings.filter(b => b.status === "PENDING");
  
  const todaysSessions = confirmedBookings.filter(b => {
    const bDate = new Date(b.date);
    return bDate >= today && bDate < tomorrow;
  });

  // Calculate Earnings
  const earningsToday = todaysSessions.reduce((sum, b) => sum + b.price, 0);
  const earningsThisWeek = confirmedBookings
    .filter(b => new Date(b.date) >= startOfWeek)
    .reduce((sum, b) => sum + b.price, 0);
  const earningsThisMonth = confirmedBookings
    .filter(b => new Date(b.date) >= startOfMonth)
    .reduce((sum, b) => sum + b.price, 0);
  const pendingPayout = Math.floor(earningsThisMonth * 0.8); // Mock value

  // @ts-ignore - Prisma client needs to be re-generated on server restart
  const pendingReschedules = await prisma.rescheduleRequest.findMany({
    where: { mentorId: session.user.id, status: "PENDING" },
    include: { booking: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Mock Notifications based on recent bookings
  const notifications: NotificationItem[] = confirmedBookings.slice(0, 3).map((b, i) => ({
    id: b.id,
    type: "BOOKING",
    title: "Booking Confirmed",
    description: `${b.user.name} booked a session`,
    time: b.createdAt.toLocaleDateString()
  }));

  // Calendar Events
  const calendarEvents: CalendarEvent[] = confirmedBookings.filter(b => new Date(b.date) >= today).slice(0, 5).map(b => {
    const bDate = new Date(b.date);
    const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][bDate.getDay()];
    return {
      id: b.id,
      day: dayName,
      time: b.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      title: "1:1 Mentorship",
      patientName: b.user.name
    };
  });

  const nextSessionTime = todaysSessions.length > 0 
    ? todaysSessions[0].startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : null;

  return (
    <div className="space-y-6 pb-12">
      <HeroHeader 
        mentorName={session.user.name || "Mentor"}
        newBookingCount={pendingBookings.length}
        rescheduleCount={pendingReschedules.length}
        todaySessionsCount={todaysSessions.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Content (Spans 2 cols on extra large screens) */}
        <div id="requests" className="xl:col-span-2 space-y-8">
          
          {/* New Booking Requests */}
          {pendingBookings.length > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                📥 New Booking Requests
              </h2>
              <BookingRequestList bookings={pendingBookings} />
            </section>
          )}

          {/* Reschedule Requests */}
          {pendingReschedules.length > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                🔄 Reschedule Requests
                <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full font-bold ml-1">
                  {pendingReschedules.length}
                </span>
              </h2>
              <RescheduleRequestList requests={pendingReschedules} />
            </section>
          )}

          {/* Today's Sessions */}
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              📅 Today's Sessions
            </h2>
            {todaysSessions.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border border-dashed rounded-2xl text-muted-foreground">
                <p>No sessions scheduled for today. Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSessions.map(session => (
                  <TodaySessionCard 
                    key={session.id}
                    id={session.id}
                    patientName={session.user.name}
                    serviceTitle="1:1 Mentorship Session"
                    timeStr={session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    meetingLink={session.meetingLink}
                    status={session.status}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Earnings */}
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Earnings</h2>
            <EarningsOverview 
              today={earningsToday}
              thisWeek={earningsThisWeek}
              thisMonth={earningsThisMonth}
              pendingPayout={pendingPayout}
            />
          </section>

        </div>

        {/* Right Panel / Notifications (Spans 1 col) */}
        <div className="space-y-6">
          <AIAssistantCard 
            summary={{
              bookingRequests: pendingBookings.length,
              rescheduleRequests: pendingReschedules.length,
              earningsToday: earningsToday,
              nextSessionTime: nextSessionTime
            }}
          />
          
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight mb-4">Notifications</h2>
            <NotificationsPanel notifications={notifications} />
          </section>
          
          <section className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight mb-4">Calendar</h2>
            <PremiumCalendarView events={calendarEvents} />
          </section>
        </div>
        
      </div>
    </div>
  );
}
