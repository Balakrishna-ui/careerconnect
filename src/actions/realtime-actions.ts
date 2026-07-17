"use server";

import { prisma } from "@/lib/prisma";

export async function getMentorDashboardRealtime(mentorUserId: string) {
  const mentor = await prisma.mentor.findUnique({
    where: { userId: mentorUserId },
    include: {
      bookings: {
        include: { user: true },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!mentor) {
    return null;
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

  // @ts-ignore
  const pendingReschedules = await prisma.rescheduleRequest.findMany({
    where: { mentorId: mentor.id, status: "PENDING" },
    include: { booking: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch true Notifications
  const notifications = await prisma.notification.findMany({
    where: { mentorId: mentor.id, type: "NEW_BOOKING_REQUEST" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const formattedNotifications = notifications.map((n) => ({
    id: n.id,
    type: "BOOKING",
    title: "New Booking Request",
    description: n.message,
    time: n.createdAt.toLocaleDateString()
  }));

  const nextSessionTime = todaysSessions.length > 0 
    ? todaysSessions[0].startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : null;

  return {
    pendingBookings: JSON.parse(JSON.stringify(pendingBookings)),
    confirmedBookings: JSON.parse(JSON.stringify(confirmedBookings)),
    todaysSessions: JSON.parse(JSON.stringify(todaysSessions)),
    pendingReschedules: JSON.parse(JSON.stringify(pendingReschedules)),
    earnings: {
      earningsToday,
      earningsThisWeek,
      earningsThisMonth,
      pendingPayout
    },
    notifications: formattedNotifications,
    nextSessionTime
  };
}

export async function getJobSeekerDashboardRealtime(userId: string) {
  const allBookings = await prisma.booking.findMany({
    where: {
      userId: userId,
    },
    include: {
      mentor: true,
      payment: true,
      // @ts-ignore
      rescheduleReq: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  // Statistics
  const totalSessions = allBookings.length;
  const completedBookings = allBookings.filter((b) => b.status === "COMPLETED" || new Date(b.endTime) < now);
  const completedSessions = completedBookings.length;
  const upcomingBookings = allBookings
    .filter((b) => (b.status === "CONFIRMED" || b.status === "PENDING") && new Date(b.endTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const amountSpent = allBookings.reduce((acc, curr) => acc + (curr.payment?.amount || 0), 0);
  const pastBookings = allBookings.filter((b) => new Date(b.endTime) < now || b.status === "CANCELLED" || b.status === "REJECTED");

  return {
    totalSessions,
    completedSessions,
    amountSpent,
    upcomingBookings: JSON.parse(JSON.stringify(upcomingBookings)),
    pastBookings: JSON.parse(JSON.stringify(pastBookings)),
    allBookings: JSON.parse(JSON.stringify(allBookings)),
  };
}
