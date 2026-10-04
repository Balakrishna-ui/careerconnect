"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getMentorId() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== "MENTOR" && session.user?.role !== "ADMIN")) {
    throw new Error("Unauthorized: Mentor access required");
  }
  
  const mentor = await prisma.mentor.findUnique({ where: { userId: session.user.id }});
  if (!mentor) throw new Error("Mentor profile not found");
  return mentor.id;
}

export async function updateMentorProfile(data: any) {
  const mentorId = await getMentorId();
  
  await prisma.mentor.update({
    where: { id: mentorId },
    data: {
      name: data.name,
      role: data.role,
      company: data.company,
      bio: data.bio,
      price: parseInt(data.price) || 0,
    }
  });

  return { success: true };
}

export async function updateMentorAvailability(isAvailable: boolean) {
  const mentorId = await getMentorId();
  
  await prisma.mentor.update({
    where: { id: mentorId },
    data: { remoteAvailable: isAvailable }
  });

  return { success: true };
}

export async function toggleVacationMode(mentorUserId: string, isVacation: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "ADMIN" && session.user.id !== mentorUserId) {
      return { success: false, error: "Unauthorized: Cannot change vacation mode for another user" };
    }

    await prisma.mentor.update({
      where: { userId: mentorUserId },
      data: { vacationMode: isVacation }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getMentorDashboardData() {
  const mentorId = await getMentorId();
  
  const [profile, bookings, reviews] = await Promise.all([
    prisma.mentor.findUnique({ where: { id: mentorId }, include: { socialProfiles: true, skills: true, sessionTypes: true } }),
    prisma.booking.findMany({ where: { mentorId }, include: { user: true, payment: true }, orderBy: { date: 'desc' } }),
    prisma.review.findMany({
      where: { mentorId },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    profile,
    bookings,
    reviews
  };
}
