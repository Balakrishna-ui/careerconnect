"use server";

import { prisma } from "@/lib/prisma";

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
  // Delete existing and recreate
  await prisma.weeklySchedule.deleteMany({ where: { mentorId } });

  await prisma.weeklySchedule.createMany({
    data: schedules.map((s) => ({
      mentorId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable,
    })),
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
  await prisma.blockedDate.delete({ where: { id } });
  return { success: true };
}

// ─── Get Bookings for Admin ──────────────────────────────────────────────────

export async function getAdminBookings(mentorId?: string) {
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
