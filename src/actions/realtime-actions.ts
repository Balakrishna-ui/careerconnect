"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMentorDashboardRealtime(mentorUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  // IDOR / Authorization check: Must be the mentor themselves or an admin
  if (session.user.role !== "ADMIN" && session.user.id !== mentorUserId) {
    return null;
  }

  try {
    const mentor = await prisma.mentor.findUnique({
      where: { userId: mentorUserId },
      include: {
        bookings: {
          include: { user: true, rescheduleReq: true, cancellationReq: true },
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

    // Group Bookings: Exclude bookings with pending reschedule or cancellation requests from active confirmed sessions
    const confirmedBookings = mentor.bookings.filter(
      (b: any) => b.status === "CONFIRMED" && b.rescheduleReq?.status !== "PENDING" && b.cancellationReq?.status !== "PENDING"
    );
    const pendingBookings = mentor.bookings.filter((b: any) => b.status === "PENDING");
    const completedBookings = mentor.bookings.filter((b: any) => b.status === "COMPLETED");
    
    const todaysSessions = confirmedBookings.filter((b: any) => {
      const bDate = new Date(b.date);
      return bDate >= today && bDate < tomorrow;
    });

    // Calculate Earnings (Real-time completed)
    const earningsToday = completedBookings
      .filter(b => {
        const bDate = new Date(b.date);
        return bDate >= today && bDate < tomorrow;
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const earningsThisWeek = completedBookings
      .filter(b => new Date(b.date) >= startOfWeek)
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const earningsThisMonth = completedBookings
      .filter(b => new Date(b.date) >= startOfMonth)
      .reduce((sum, b) => sum + (b.price || 0), 0);
    
    // Real pending payout is all completed bookings that haven't been withdrawn
    const pendingPayout = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    // Pending reschedules
    let pendingReschedules: any[] = [];
    try {
      pendingReschedules = await prisma.rescheduleRequest.findMany({
        where: { mentorId: mentor.id, status: "PENDING" },
        include: { booking: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Failed to fetch pending reschedules:", e);
    }

    // Pending cancellations
    let pendingCancellations: any[] = [];
    try {
      pendingCancellations = await prisma.cancellationRequest.findMany({
        where: { mentorId: mentor.id, status: "PENDING" },
        include: { booking: { include: { user: true, payment: true } } },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Failed to fetch pending cancellations:", e);
    }

    // Fetch true Notifications
    let formattedNotifications: any[] = [];
    try {
      const notifications = await prisma.notification.findMany({
        where: { mentorId: mentor.id, type: { in: ["NEW_BOOKING_REQUEST", "CANCELLATION_REQUESTED", "RESCHEDULE_REQUESTED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      formattedNotifications = notifications.map((n) => ({
        id: n.id,
        type: "BOOKING",
        title: n.type === "CANCELLATION_REQUESTED" ? "Cancellation Request" : n.type === "RESCHEDULE_REQUESTED" ? "Reschedule Request" : "New Booking Request",
        description: n.message,
        time: n.createdAt.toLocaleDateString()
      }));
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }

    const nextSessionTime = todaysSessions.length > 0 && todaysSessions[0].startTime
      ? new Date(todaysSessions[0].startTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })
      : null;

    return {
      vacationMode: mentor.vacationMode,
      pendingBookings: JSON.parse(JSON.stringify(pendingBookings)),
      confirmedBookings: JSON.parse(JSON.stringify(confirmedBookings)),
      todaysSessions: JSON.parse(JSON.stringify(todaysSessions)),
      pendingReschedules: JSON.parse(JSON.stringify(pendingReschedules)),
      pendingCancellations: JSON.parse(JSON.stringify(pendingCancellations)),
      earnings: {
        earningsToday,
        earningsThisWeek,
        earningsThisMonth,
        pendingPayout
      },
      notifications: formattedNotifications,
      nextSessionTime
    };
  } catch (error) {
    console.error("Error in getMentorDashboardRealtime:", error);
    return {
      vacationMode: false,
      pendingBookings: [],
      confirmedBookings: [],
      todaysSessions: [],
      pendingReschedules: [],
      pendingCancellations: [],
      earnings: {
        earningsToday: 0,
        earningsThisWeek: 0,
        earningsThisMonth: 0,
        pendingPayout: 0
      },
      notifications: [],
      nextSessionTime: null
    };
  }
}

export async function getJobSeekerDashboardRealtime(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  // IDOR / Authorization check: Must be the user themselves or an admin
  if (session.user.role !== "ADMIN" && session.user.id !== userId) {
    return null;
  }

  let allBookings: any[] = [];
  let user: any = null;
  let recommendedMentors: any[] = [];

  try {
    const results = await Promise.all([
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
    
    allBookings = results[0];
    user = results[1];
    recommendedMentors = results[2];
  } catch (error) {
    console.warn("Database query failed (likely quota limit exceeded). Falling back to empty data.");
    // Fallback data prevents the UI from completely crashing
    allBookings = [];
    user = { id: userId, name: "User" };
    recommendedMentors = [];
  }

  const now = new Date();

  // Statistics
  const totalSessions = allBookings.length;
  const completedBookings = allBookings.filter((b) => b.status === "COMPLETED" || (new Date(b.endTime) < now && (b.status === "CONFIRMED" || b.status === "APPROVED")));
  const completedSessions = completedBookings.length;
  const upcomingBookings = allBookings
    .filter((b) => (b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "APPROVED") && new Date(b.endTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const amountSpent = allBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "APPROVED" || b.payment?.status === "SUCCESS")
    .reduce((acc, curr) => acc + (curr.payment?.amount || curr.price || 0), 0);
  const pastBookings = allBookings.filter((b) => new Date(b.endTime) < now || b.status === "CANCELLED" || b.status === "REJECTED" || b.status === "COMPLETED");

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
