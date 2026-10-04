"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware should ideally protect these, but we double-check roles here
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    // For development/testing purposes, if we want to allow skipping auth:
    // return true; 
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user.id;
}

export async function getAdminDashboardStats() {
  await checkAdmin();

  const [
    totalUsers,
    premiumUsers,
    totalMentors,
    pendingMentors,
    totalRevenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { premium: true } }),
    prisma.mentor.count({ where: { applicationStatus: "VERIFIED" } }),
    prisma.mentor.count({ where: { applicationStatus: "PENDING" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } })
  ]);

  const sessionCount = await prisma.booking.count();
  
  // Calculate user growth and revenue growth (dummy values for now since we don't have historical tracking)
  const userGrowth = 12.4;
  const revenueGrowth = 18.7;
  const sessionGrowth = 9.2;
  const todaySessions = await prisma.booking.count({
    where: {
      startTime: {
        gte: new Date(new Date().setHours(0,0,0,0)),
        lte: new Date(new Date().setHours(23,59,59,999))
      }
    }
  });

  return {
    totalUsers,
    totalMentors,
    totalJobSeekers: totalUsers - totalMentors, // Approximation
    premiumUsers,
    verifiedMentors: totalMentors,
    pendingVerifications: pendingMentors,
    todaySessions,
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: (totalRevenue._sum.amount || 0) * 0.15, // Approximation for this month
    userGrowth,
    revenueGrowth,
    sessionGrowth
  };
}

export async function getPendingMentors() {
  await checkAdmin();
  
  return await prisma.mentor.findMany({
    where: { applicationStatus: "PENDING" },
    include: {
      documents: true,
      socialProfiles: true,
      user: {
        select: { email: true }
      }
    }
  });
}

export async function approveMentor(mentorId: string) {
  const adminId = await checkAdmin();
  
  await prisma.$transaction([
    prisma.mentor.update({
      where: { id: mentorId },
      data: { applicationStatus: "VERIFIED" }
    }),
    prisma.adminReview.create({
      data: {
        mentorId,
        adminId, // Note: Need actual admin ID here in production
        statusGiven: "VERIFIED",
        reason: "Approved via Admin Dashboard"
      }
    })
  ]);
  
  // Optionally update user role to MENTOR
  const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
  if (mentor) {
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { role: "MENTOR" }
    });
  }

  return { success: true };
}

export async function getAdminSessions() {
  await checkAdmin();
  
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      mentor: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      },
      user: {
        select: { name: true, email: true }
      },
      payment: true
    }
  });

  return bookings.map(booking => ({
    id: `BK-${booking.id.slice(-6).toUpperCase()}`,
    originalId: booking.id,
    mentorName: booking.mentor.name || booking.mentor.user?.name || "Unknown",
    mentorCompany: booking.mentor.company || "Independent",
    jobSeekerName: booking.user.name || "Unknown",
    date: booking.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: booking.startTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: true }),
    duration: Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / 60000),
    paymentStatus: booking.payment?.status === "SUCCESS" || booking.payment?.status === "PAID" ? "success" : booking.payment?.status === "REFUNDED" ? "refunded" : booking.payment?.status === "FAILED" ? "failed" : "pending",
    sessionStatus: booking.status === "COMPLETED" ? "completed" : booking.status === "CANCELLED" ? "cancelled" : booking.status === "REJECTED" ? "cancelled" : new Date(booking.startTime) < new Date() && booking.status !== "COMPLETED" ? "no_show" : "scheduled",
    amount: (booking.payment?.amount || booking.price || 0),
    platform: booking.meetingLink ? (booking.meetingLink.includes("zoom") ? "Zoom" : booking.meetingLink.includes("meet") ? "Google Meet" : "Teams") : "TBD"
  }));
}

export async function rejectMentor(mentorId: string, reason: string) {
  const adminId = await checkAdmin();
  
  await prisma.$transaction([
    prisma.mentor.update({
      where: { id: mentorId },
      data: { applicationStatus: "REJECTED" }
    }),
    prisma.adminReview.create({
      data: {
        mentorId,
        adminId,
        statusGiven: "REJECTED",
        reason
      }
    })
  ]);

  return { success: true };
}

export async function getAdminMentors() {
  await checkAdmin();
  const mentors = await prisma.mentor.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          mobile: true,
          createdAt: true,
          accountStatus: true
        }
      },
      bookings: {
        where: { payment: { status: "SUCCESS" } },
        select: { 
          id: true,
          status: true,
          price: true,
          payment: { select: { amount: true } } 
        }
      }
    }
  });

  return mentors.map(m => ({
    id: m.id,
    userId: m.user.id || m.userId,
    name: m.user.name || m.name || "Unknown",
    email: m.user.email || "",
    mobile: m.user.mobile || "N/A",
    company: m.company || "Independent",
    designation: m.role || "Mentor",
    category: m.industry || "General",
    verificationStatus: m.applicationStatus.toLowerCase(), // "pending", "verified", etc.
    accountStatus: m.user.accountStatus?.toLowerCase() || "active",
    rating: m.rating || 0,
    sessionsCompleted: m.bookings.length,
    earnings: m.bookings.reduce((acc, b) => acc + (b.payment?.amount || b.price || 0), 0),
    joinedAt: m.user.createdAt.toLocaleDateString(),
    image: m.user.image || m.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user.name || "M")}`,
    location: m.location || "Remote"
  }));
}

export async function getAdminJobSeekers() {
  await checkAdmin();
  const users = await prisma.user.findMany({
    where: { 
      role: {
        in: ["USER", "JOB_SEEKER"]
      } 
    },
    include: {
      bookings: {
        include: { payment: true }
      }
    }
  });

  return users.map(u => ({
    id: u.id,
    name: u.name || "Unknown",
    email: u.email || "",
    mobile: u.mobile || "N/A",
    sessionsBooked: u.bookings.length,
    totalSpend: u.bookings.reduce((acc, b) => acc + (b.payment?.amount || b.price || 0), 0),
    accountStatus: u.accountStatus?.toLowerCase() || "active",
    joinedAt: u.createdAt.toLocaleDateString(),
    lastActive: u.updatedAt.toLocaleDateString(),
    image: u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}`,
    location: "Global",
    targetRole: "Job Seeker"
  }));
}

export async function suspendUserAccount(userId: string) {
  const adminId = await checkAdmin();
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { accountStatus: "SUSPENDED" }
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended by CareerConnect administration. You currently cannot access mentor features or receive new bookings. Please contact support if you believe this was a mistake."
      }
    })
  ]);

  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const adminId = await checkAdmin();
  
  // Attempt to create notification (might fail if email/notification requires user existence, but we do this before delete)
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_DELETED",
        message: "Your CareerConnect account has been permanently deleted by administration."
      }
    });
  } catch (e) {
    console.error("Failed to notify user before deletion", e);
  }

  // Delete user (Prisma cascade will handle mentor, bookings, etc.)
  await prisma.user.delete({
    where: { id: userId }
  });

  return { success: true };
}

export async function getMentorFullProfile(mentorId: string) {
  await checkAdmin();
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          accountStatus: true
        }
      },
      experiences: true,
      educations: true,
      skills: true,
      projects: true,
      certifications: true,
      sessionTypes: true,
      socialProfiles: true,
      documents: true
    }
  });
  
  return mentor;
}

export async function getMentorBookings(mentorId: string) {
  await checkAdmin();
  const bookings = await prisma.booking.findMany({
    where: { mentorId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true, image: true }
      },
      payment: true
    }
  });
  
  return bookings;
}
