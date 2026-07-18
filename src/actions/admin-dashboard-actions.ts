"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Ensures the caller is an ADMIN
 */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

/**
 * Gets all the high-level KPI stats for the top of the Admin Dashboard
 */
export async function getAdminKPIs() {
  await requireAdmin();

  const now = new Date();
  
  // Start of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Users
  const totalUsers = await prisma.user.count();
  const totalMentors = await prisma.mentor.count();
  const totalJobSeekers = totalUsers - totalMentors; 

  // Mentor Verification
  const verifiedMentors = await prisma.mentor.count({
    where: { applicationStatus: "VERIFIED" }
  });
  const pendingVerifications = await prisma.mentor.count({
    where: { applicationStatus: "PENDING" }
  });

  // Sessions
  const todaySessions = await prisma.booking.count({
    where: {
      date: {
        gte: startOfToday,
        lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  // Revenue (We only count successful payments)
  const allSuccessfulPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    select: { amount: true, createdAt: true }
  });

  const totalRevenue = allSuccessfulPayments.reduce((acc, p) => acc + p.amount, 0);
  
  const monthlyPayments = allSuccessfulPayments.filter(p => p.createdAt >= startOfMonth);
  const monthlyRevenue = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);

  return {
    totalUsers,
    totalMentors,
    totalJobSeekers,
    verifiedMentors,
    pendingVerifications,
    todaySessions,
    totalRevenue,
    monthlyRevenue,
    userGrowth: 15.2, // Placeholder
    revenueGrowth: 8.5,
    sessionGrowth: 12.0
  };
}

/**
 * Gets data for the Revenue chart (last 6-12 months)
 */
export async function getAdminRevenueTrend() {
  await requireAdmin();
  
  const payments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  const monthlyData: Record<string, { revenue: number, commission: number, payouts: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  payments.forEach(p => {
    const monthName = months[p.createdAt.getMonth()];
    if (!monthlyData[monthName]) {
      monthlyData[monthName] = { revenue: 0, commission: 0, payouts: 0 };
    }
    const amount = p.amount;
    const commission = amount * 0.15; // Assuming 15% platform commission
    const payouts = amount - commission;
    
    monthlyData[monthName].revenue += amount;
    monthlyData[monthName].commission += commission;
    monthlyData[monthName].payouts += payouts;
  });

  return Object.keys(monthlyData).map(month => ({
    month,
    revenue: monthlyData[month].revenue,
    commission: monthlyData[month].commission,
    payouts: monthlyData[month].payouts
  }));
}

/**
 * Gets data for User Growth Chart
 */
export async function getUserGrowthTrend() {
  await requireAdmin();
  
  const users = await prisma.user.findMany({
    select: { createdAt: true, role: true },
    orderBy: { createdAt: 'asc' }
  });

  const monthlyData: Record<string, { mentors: number, jobSeekers: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let cumMentors = 0;
  let cumJobSeekers = 0;

  users.forEach(u => {
    const monthName = months[u.createdAt.getMonth()];
    if (!monthlyData[monthName]) {
      monthlyData[monthName] = { mentors: cumMentors, jobSeekers: cumJobSeekers };
    }
    if (u.role === "MENTOR") {
      cumMentors++;
    } else {
      cumJobSeekers++;
    }
    monthlyData[monthName].mentors = cumMentors;
    monthlyData[monthName].jobSeekers = cumJobSeekers;
  });

  return Object.keys(monthlyData).map(month => ({
    month,
    mentors: monthlyData[month].mentors,
    jobSeekers: monthlyData[month].jobSeekers
  }));
}

/**
 * Gets Mentor Verification Stats for Pie Chart
 */
export async function getVerificationStatusStats() {
  await requireAdmin();

  const mentors = await prisma.mentor.groupBy({
    by: ['applicationStatus'],
    _count: {
      applicationStatus: true
    }
  });

  const colorMap: Record<string, string> = {
    "VERIFIED": "#10b981",
    "PENDING": "#f59e0b",
    "UNDER_REVIEW": "#3b82f6",
    "REJECTED": "#ef4444",
    "DRAFT": "#6b7280"
  };

  const nameMap: Record<string, string> = {
    "VERIFIED": "Verified",
    "PENDING": "Pending",
    "UNDER_REVIEW": "Under Review",
    "REJECTED": "Rejected",
    "DRAFT": "Draft"
  };

  return mentors.map(m => ({
    name: nameMap[m.applicationStatus] || m.applicationStatus,
    value: m._count.applicationStatus,
    color: colorMap[m.applicationStatus] || "#cccccc"
  }));
}

/**
 * Gets the most recent bookings
 */
export async function getRecentAdminSessions() {
  await requireAdmin();

  const sessions = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      mentor: true,
      payment: true
    }
  });

  return sessions.map(s => ({
    id: s.id,
    jobSeekerName: s.user.name,
    mentorName: s.mentor.name,
    date: s.date.toLocaleDateString(),
    time: s.startTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: true }),
    duration: Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60000),
    amount: s.price,
    sessionStatus: s.status,
    paymentStatus: s.payment?.status || "pending",
  }));
}

/**
 * Gets all payments for the admin payments page
 */
export async function getAdminPayments() {
  await requireAdmin();

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        include: {
          user: true,
          mentor: true
        }
      }
    }
  });

  return payments.map(p => ({
    id: p.id,
    transactionId: p.razorpayPaymentId || `pay_${p.id.substring(0,8)}`,
    userName: p.booking.user.name,
    mentorName: p.booking.mentor.name,
    amount: p.amount,
    tax: p.amount * 0.18,
    commission: p.amount * 0.15,
    status: p.status.toLowerCase(),
    date: p.createdAt.toLocaleDateString(),
    gateway: "Razorpay"
  }));
}
