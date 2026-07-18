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
  const completedBookings = mentor.bookings.filter(b => b.status === "COMPLETED");
  
  const todaysSessions = confirmedBookings.filter(b => {
    const bDate = new Date(b.date);
    return bDate >= today && bDate < tomorrow;
  });

  // Calculate Earnings (Real-time completed vs expected today)
  const earningsToday = todaysSessions.reduce((sum, b) => sum + b.price, 0);
  const earningsThisWeek = completedBookings
    .filter(b => new Date(b.date) >= startOfWeek)
    .reduce((sum, b) => sum + b.price, 0);
  const earningsThisMonth = completedBookings
    .filter(b => new Date(b.date) >= startOfMonth)
    .reduce((sum, b) => sum + b.price, 0);
  
  // Real pending payout is all completed bookings that haven't been withdrawn
  const pendingPayout = completedBookings.reduce((sum, b) => sum + b.price, 0);

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
    ? todaysSessions[0].startTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })
    : null;

  return {
    vacationMode: mentor.vacationMode,
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
  const [allBookings, user, recommendedMentors] = await Promise.all([
    prisma.booking.findMany({
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
    }),
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.mentor.findMany({
      where: { applicationStatus: "VERIFIED" },
      orderBy: { rating: "desc" },
      take: 5,
    })
  ]);

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

  let profileCompletion = 0;
  let nextStep = "";
  if (user) {
    let score = 0;
    if (user.name) score += 25;
    else if (!nextStep) nextStep = "Add your name";
    
    if (user.email) score += 25;
    else if (!nextStep) nextStep = "Verify your email";
    
    if (user.mobile) score += 25;
    else if (!nextStep) nextStep = "Add your mobile number";
    
    if (user.image) score += 25;
    else if (!nextStep) nextStep = "Add a profile picture";
    
    if (!nextStep && score === 100) nextStep = "Explore mentors";
    profileCompletion = score;
  }

  return {
    totalSessions,
    completedSessions,
    amountSpent,
    upcomingBookings: JSON.parse(JSON.stringify(upcomingBookings)),
    pastBookings: JSON.parse(JSON.stringify(pastBookings)),
    allBookings: JSON.parse(JSON.stringify(allBookings)),
    profileCompletion,
    nextStep,
    recommendedMentors: JSON.parse(JSON.stringify(recommendedMentors))
  };
}
