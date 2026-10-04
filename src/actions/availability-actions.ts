"use server";

import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Helper: Verify Mentor Ownership or Admin ────────────────────────────────

async function verifyMentorAccess(mentorId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "ADMIN") {
    return { session, isAdmin: true };
  }

  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    select: { userId: true },
  });

  if (!mentor || mentor.userId !== session.user.id) {
    throw new Error("Unauthorized: You do not own this mentor profile");
  }

  return { session, isAdmin: false };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeeklyScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface MentorSettingsData {
  sessionDuration: number;
  bufferTime: number;
  maxSessionsPerDay: number;
  advanceBookingWindow: number;
  noticePeriod: number;
}

export interface BlockedDateItem {
  id: string;
  date: string;
  reason: string | null;
}

// ─── Get All Mentors (for admin dropdown) ────────────────────────────────────

export async function getAllMentorsForAdmin() {
  await requireAdmin();

  const mentors = await prisma.mentor.findMany({
    select: { id: true, name: true, company: true, role: true },
    orderBy: { name: "asc" },
  });
  return mentors;
}

// ─── Get Mentor Weekly Schedule ──────────────────────────────────────────────

export async function getMentorWeeklySchedule(
  mentorId: string
): Promise<WeeklyScheduleItem[]> {
  const schedules = await prisma.weeklySchedule.findMany({
    where: { mentorId },
    orderBy: { dayOfWeek: "asc" },
  });

  // Return all 7 days, filling in defaults for missing ones
  const result: WeeklyScheduleItem[] = [];
  for (let d = 0; d < 7; d++) {
    const existing = schedules.find((s) => s.dayOfWeek === d);
    result.push({
      dayOfWeek: d,
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "17:00",
      isAvailable: existing?.isAvailable ?? false,
    });
  }
  return result;
}

// ─── Update Weekly Schedule ──────────────────────────────────────────────────

export async function updateWeeklySchedule(
  mentorId: string,
  schedules: WeeklyScheduleItem[]
) {
  await verifyMentorAccess(mentorId);

  // Delete existing and recreate atomically inside a transaction
  await prisma.$transaction(async (tx) => {
    await tx.weeklySchedule.deleteMany({ where: { mentorId } });

    await tx.weeklySchedule.createMany({
      data: schedules.map((s) => ({
        mentorId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable,
      })),
    });
  });

  return { success: true };
}

// ─── Get Mentor Settings ─────────────────────────────────────────────────────

export async function getMentorSettings(
  mentorId: string
): Promise<MentorSettingsData> {
  const settings = await prisma.mentorSettings.findUnique({
    where: { mentorId },
  });

  return {
    sessionDuration: settings?.sessionDuration ?? 60,
    bufferTime: settings?.bufferTime ?? 15,
    maxSessionsPerDay: settings?.maxSessionsPerDay ?? 5,
    advanceBookingWindow: settings?.advanceBookingWindow ?? 30,
    noticePeriod: settings?.noticePeriod ?? 24,
  };
}

// ─── Update Mentor Settings ──────────────────────────────────────────────────

export async function updateMentorSettings(
  mentorId: string,
  data: MentorSettingsData
) {
  await verifyMentorAccess(mentorId);

  await prisma.mentorSettings.upsert({
    where: { mentorId },
    update: data,
    create: { mentorId, ...data },
  });

  return { success: true };
}

// ─── Get Blocked Dates ───────────────────────────────────────────────────────

export async function getBlockedDates(
  mentorId: string
): Promise<BlockedDateItem[]> {
  const blocked = await prisma.blockedDate.findMany({
    where: { mentorId },
    orderBy: { date: "asc" },
  });

  return blocked.map((b) => ({
    id: b.id,
    date: b.date.toISOString().split("T")[0],
    reason: b.reason,
  }));
}

// ─── Add Blocked Date ────────────────────────────────────────────────────────

export async function addBlockedDate(
  mentorId: string,
  dateStr: string,
  reason: string
) {
  await verifyMentorAccess(mentorId);

  const date = new Date(dateStr + "T00:00:00.000Z");

  try {
    await prisma.blockedDate.create({
      data: { mentorId, date, reason: reason || null },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Date already blocked" };
  }
}

// ─── Remove Blocked Date ─────────────────────────────────────────────────────

export async function removeBlockedDate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const blockedDate = await prisma.blockedDate.findUnique({
    where: { id },
    include: { mentor: true },
  });

  if (!blockedDate) {
    return { success: false, error: "Blocked date not found" };
  }

  if (session.user.role !== "ADMIN" && blockedDate.mentor.userId !== session.user.id) {
    throw new Error("Unauthorized to remove this blocked date");
  }

  await prisma.blockedDate.delete({ where: { id } });
  return { success: true };
}

// ─── Get Bookings for Admin ──────────────────────────────────────────────────

export async function getAdminBookings(mentorId?: string) {
  await requireAdmin();

  const where = mentorId ? { mentorId } : {};
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      mentor: { select: { name: true, company: true } },
      user: { select: { name: true, email: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return JSON.parse(JSON.stringify(bookings));
}
