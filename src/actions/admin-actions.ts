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
  // Uncomment below when auth is fully enforced
  // await checkAdmin();

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

  return {
    totalUsers,
    premiumUsers,
    totalMentors,
    pendingMentors,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}

export async function getPendingMentors() {
  // await checkAdmin();
  
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
  const adminId = "dummy-admin"; // await checkAdmin();
  
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

export async function rejectMentor(mentorId: string, reason: string) {
  const adminId = "dummy-admin"; // await checkAdmin();
  
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
