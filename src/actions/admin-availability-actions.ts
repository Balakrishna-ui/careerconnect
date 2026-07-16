"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getAdminAvailabilityData() {
  await requireAdmin();

  // Get all verified mentors and their relevant data
  const mentors = await prisma.mentor.findMany({
    where: { applicationStatus: "VERIFIED" },
    include: {
      weeklySchedules: true,
      blockedDates: true,
      bookings: {
        where: { status: { in: ["PENDING", "ACCEPTED"] } } // upcoming sessions
      }
    }
  });

  const formattedMentors = mentors.map((m) => {
    // Format schedule
    const schedule = DAYS_MAP.map((dayName, index) => {
      const dayData = m.weeklySchedules.find(ws => ws.dayOfWeek === index && ws.isAvailable);
      return {
        day: dayName,
        slots: dayData ? [`${dayData.startTime}–${dayData.endTime}`] : []
      };
    });

    const totalSlotsCount = schedule.reduce((acc, d) => acc + d.slots.length, 0);

    // Calculate status based on bookings and blocked dates
    let status = "active";
    if (totalSlotsCount === 0) {
      status = "unavailable";
    } else if (m.bookings.length > 5 || m.blockedDates.length > 5) {
      status = "busy";
    }

    return {
      id: m.id,
      name: m.name,
      role: m.role || "Mentor",
      company: m.company || "Independent",
      image: m.image,
      totalSessions: m.totalSessions,
      upcomingSessions: m.bookings.length,
      blockedDates: m.blockedDates.length,
      status,
      schedule
    };
  });

  // Format blocked dates log
  const allBlockedDates = await prisma.blockedDate.findMany({
    include: { mentor: true },
    orderBy: { date: "asc" }
  });

  const formattedBlockedDates = allBlockedDates.map(b => ({
    mentor: b.mentor.name,
    date: b.date.toISOString(),
    reason: b.reason || "Not specified"
  }));

  return {
    mentors: formattedMentors,
    blockedDatesLog: formattedBlockedDates
  };
}
