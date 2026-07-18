"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  startOfDay,
  format,
  addMinutes,
  isBefore,
  isEqual,
  parseISO,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailableDate {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number;
  slotsCount: number;
}

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  available: boolean;
}

export interface MentorBookingProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string | null;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  services: { id: string; title: string; duration: number; price: number }[];
  bufferTime: number;
}

// ─── Get Mentor Booking Profile ──────────────────────────────────────────────

export async function getMentorBookingProfile(
  mentorId: string
): Promise<MentorBookingProfile | null> {
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { settings: true, sessionTypes: true },
  });

  if (!mentor) return null;

  return {
    id: mentor.id,
    name: mentor.name,
    role: mentor.role || "",
    company: mentor.company || "",
    image: mentor.image,
    rating: mentor.rating,
    reviewsCount: mentor.reviewsCount,
    verified: mentor.applicationStatus === "VERIFIED",
    services: mentor.sessionTypes.map(s => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      price: s.price
    })),
    bufferTime: mentor.settings?.bufferTime ?? 15,
  };
}

// ─── Get Available Dates for a Month ─────────────────────────────────────────

export async function getAvailableDates(
  mentorId: string,
  year: number,
  month: number, // 0-indexed (JS Date convention)
  sessionDuration: number = 60,
  userTimeZone: string = "UTC"
): Promise<AvailableDate[]> {
  // Fetch mentor settings
  const settings = await prisma.mentorSettings.findUnique({
    where: { mentorId },
  });

  const advanceDays = settings?.advanceBookingWindow ?? 60;
  const noticePeriodHours = settings?.noticePeriod ?? 24;
  const bufferTime = settings?.bufferTime ?? 15;
  const maxPerDay = settings?.maxSessionsPerDay ?? 8;

  // Fetch weekly schedules
  const weeklySchedules = await prisma.weeklySchedule.findMany({
    where: { mentorId, isAvailable: true },
  });

  if (weeklySchedules.length === 0) return [];

  // Build a lookup: dayOfWeek -> schedule
  const scheduleByDay = new Map<
    number,
    { startTime: string; endTime: string }
  >();
  weeklySchedules.forEach((ws) =>
    scheduleByDay.set(ws.dayOfWeek, {
      startTime: ws.startTime,
      endTime: ws.endTime,
    })
  );

  // Date range: today + noticePeriod ... today + advanceDays
  const now = new Date();
  const earliestDate = addDays(
    startOfDay(now),
    Math.ceil(noticePeriodHours / 24)
  );
  const latestDate = addDays(startOfDay(now), advanceDays);

  // Month boundaries
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // last day of month

  // Effective range
  const rangeStart = isBefore(monthStart, earliestDate)
    ? earliestDate
    : monthStart;
  const rangeEnd = isBefore(latestDate, monthEnd) ? latestDate : monthEnd;

  if (isBefore(rangeEnd, rangeStart)) return [];

  // Fetch blocked dates in range
  const blockedDates = await prisma.blockedDate.findMany({
    where: {
      mentorId,
      date: {
        gte: rangeStart,
        lte: rangeEnd,
      },
    },
  });

  const blockedSet = new Set(
    blockedDates.map((bd) => format(new Date(bd.date), "yyyy-MM-dd"))
  );

  // Fetch existing bookings in range to count per-day
  const bookings = await prisma.booking.findMany({
    where: {
      mentorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: {
        gte: rangeStart,
        lte: rangeEnd,
      },
    },
  });

  // Count bookings per date
  const bookingsPerDate = new Map<string, number>();
  bookings.forEach((b) => {
    const key = format(new Date(b.date), "yyyy-MM-dd");
    bookingsPerDate.set(key, (bookingsPerDate.get(key) ?? 0) + 1);
  });

  // Iterate each day in range
  const result: AvailableDate[] = [];
  let cursor = new Date(rangeStart);

  while (!isBefore(rangeEnd, cursor)) {
    const dateStr = format(cursor, "yyyy-MM-dd");
    const dow = cursor.getDay(); // 0=Sun

    // Check if schedule exists for this day
    const sched = scheduleByDay.get(dow);

    if (sched && !blockedSet.has(dateStr)) {
      // Calculate slots for this day
      const dayBookingCount = bookingsPerDate.get(dateStr) ?? 0;

      if (dayBookingCount < maxPerDay) {
        // Calculate how many slots fit
        const [sh, sm] = sched.startTime.split(":").map(Number);
        const [eh, em] = sched.endTime.split(":").map(Number);
        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;
        const slotBlock = sessionDuration + bufferTime;
        const totalSlots = Math.floor((endMins - startMins) / slotBlock);
        const remainingSlots = Math.max(
          0,
          Math.min(totalSlots, maxPerDay) - dayBookingCount
        );

        if (remainingSlots > 0) {
          result.push({
            date: dateStr,
            dayOfWeek: dow,
            slotsCount: remainingSlots,
          });
        }
      }
    }

    cursor = addDays(cursor, 1);
  }

  return result;
}

// ─── Get Available Time Slots for a Specific Date ────────────────────────────

export async function getAvailableSlots(
  mentorId: string,
  dateStr: string,
  sessionDuration: number = 60,
  userTimeZone: string = "UTC"
): Promise<TimeSlot[]> {
  const date = parseISO(dateStr); // "YYYY-MM-DD"
  const dayOfWeek = date.getDay();

  // Fetch settings & schedule
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { settings: true, weeklySchedules: true },
  });

  if (!mentor || !mentor.weeklySchedules) return [];

  const settings = mentor.settings;
  const bufferTime = settings?.bufferTime ?? 15;

  // Get schedule for this day of week
  const schedule = mentor.weeklySchedules.find((s: any) => s.dayOfWeek === dayOfWeek);

  if (!schedule || !schedule.isAvailable) return [];

  // Get existing bookings for this date
  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);

  const existingBookings = await prisma.booking.findMany({
    where: {
      mentorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
  });

  // Parse booked time ranges
  const bookedRanges = existingBookings.map((b) => ({
    start: format(new Date(b.startTime), "HH:mm"),
    end: format(new Date(b.endTime), "HH:mm"),
  }));

  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  
  const mentorTimeZone = mentor.timezone || "UTC";

  // Mentor's slot times are stored as strings (e.g. "09:00") in the mentor's timezone.
  // We construct the start/end Date objects in the mentor's timezone.
  const mentorBaseStr = `${format(date, "yyyy-MM-dd")}T${schedule.startTime}:00`;
  const mentorEndStr = `${format(date, "yyyy-MM-dd")}T${schedule.endTime}:00`;
  
  // Convert mentor's local time string to UTC Date
  let currentUTC = fromZonedTime(mentorBaseStr, mentorTimeZone);
  const endUTC = fromZonedTime(mentorEndStr, mentorTimeZone);

  const slots: TimeSlot[] = [];

  while (true) {
    const slotEndUTC = addMinutes(currentUTC, sessionDuration);

    if (isBefore(endUTC, slotEndUTC) && !isEqual(endUTC, slotEndUTC)) break;

    // Convert slot UTC time to user's timezone for display
    const slotStartUser = toZonedTime(currentUTC, userTimeZone);
    const slotEndUser = toZonedTime(slotEndUTC, userTimeZone);
    
    // Check if the slot belongs to the requested date in the user's timezone
    if (format(slotStartUser, "yyyy-MM-dd") !== dateStr) {
      // Move to next slot (session + buffer)
      currentUTC = addMinutes(currentUTC, sessionDuration + bufferTime);
      continue;
    }

    const slotStartStr = format(slotStartUser, "HH:mm");
    const slotEndStr = format(slotEndUser, "HH:mm");

    // Check overlaps (bookedRanges are in UTC from DB)
    const isBooked = existingBookings.some((booked) => {
       return currentUTC < booked.endTime && slotEndUTC > booked.startTime;
    });

    slots.push({
      start: slotStartStr,
      end: slotEndStr,
      available: !isBooked,
    });

    // Move to next slot (session + buffer)
    currentUTC = addMinutes(currentUTC, sessionDuration + bufferTime);
  }

  return slots;
}

// ─── Create a Booking ────────────────────────────────────────────────────────

export async function createBooking(data: {
  mentorId: string;
  userId: string;
  serviceId: string;
  dateStr: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  userTimeZone?: string;
  goal?: string;
  experience?: string;
  message?: string;
  resumeUrl?: string;
}) {
  const { mentorId, userId, serviceId, dateStr, startTime, userTimeZone = "UTC", goal, experience, message, resumeUrl } = data;

  // Get service
  const service = await prisma.sessionType.findUnique({
    where: { id: serviceId }
  });
  if (!service || service.mentorId !== mentorId) {
    return { success: false, error: "Invalid service selected." };
  }

  // Verify slot is still available
  const slots = await getAvailableSlots(mentorId, dateStr, service.duration, userTimeZone);
  const slot = slots.find((s) => s.start === startTime && s.available);

  if (!slot) {
    return { success: false, error: "This time slot is no longer available." };
  }

  // Get mentor
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { settings: true },
  });

  if (!mentor) {
    return { success: false, error: "Mentor not found." };
  }

  const sessionDuration = service.duration;
  
  // Construct the booked time in UTC based on the user's timezone selection
  const userDateTimeStr = `${dateStr}T${startTime}:00`;
  const bookingStart = fromZonedTime(userDateTimeStr, userTimeZone);
  const bookingEnd = addMinutes(bookingStart, sessionDuration);

  // Create booking + payment in a transaction
  const booking = await prisma.booking.create({
    data: {
      userId,
      mentorId,
      date: startOfDay(bookingStart),
      startTime: bookingStart,
      endTime: bookingEnd,
      status: "AWAITING_PAYMENT",
      price: service.price,
      goal,
      experience,
      message,
      resumeUrl,
    },
  });

  // Force test mode for testing phase
  const isTestMode = true; // process.env.NEXT_PUBLIC_PAYMENT_MODE === "test";
  let razorpayOrderId = `order_${booking.id.slice(0, 12)}_${Date.now()}`;
  
  if (!isTestMode) {
    try {
      const { razorpay } = require("@/lib/razorpay");
      const order = await razorpay.orders.create({
        amount: service.price * 100,
        currency: "INR",
        receipt: booking.id
      });
      razorpayOrderId = order.id;
    } catch (error) {
      console.error("Razorpay order creation failed (falling back to mock ID):", error);
    }
  } else {
    console.log("[Test Mode] Payment bypassed for order creation.");
    razorpayOrderId = `test_order_${Date.now()}`;
  }

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: service.price,
      status: "PENDING",
      razorpayOrderId,
    },
  });

  return {
    success: true,
    bookingId: booking.id,
    razorpayOrderId,
    amount: service.price,
  };
}

// ─── Confirm Booking (after payment) ─────────────────────────────────────────

export async function confirmBooking(data: {
  bookingId: string;
  razorpayPaymentId: string;
}) {
  const { bookingId, razorpayPaymentId } = data;

  // Generate a mock meeting link
  const meetingLink = `https://meet.google.com/sas-${bookingId.slice(0, 4)}-${bookingId.slice(4, 8)}`;

  // Update booking
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PENDING", // PENDING Mentor Approval
    },
    include: {
      mentor: true,
    },
  });

  // Update payment
  await prisma.payment.update({
    where: { bookingId },
    data: {
      razorpayPaymentId,
      status: "SUCCESS",
    },
  });

  // Update mentor total sessions
  await prisma.mentor.update({
    where: { id: booking.mentorId },
    data: { totalSessions: { increment: 1 } },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      bookingId,
      userId: booking.userId,
      mentorId: booking.mentorId,
      type: "EMAIL",
      message: `Your booking request with ${booking.mentor.name} has been sent and is awaiting approval.`,
      status: "SENT",
    },
  });

  return {
    success: true,
    booking: JSON.parse(JSON.stringify(booking)),
    meetingLink: "Pending Mentor Approval",
  };
}

// ─── Mentor Lifecycle Actions ────────────────────────────────────────────────

export async function acceptBooking(bookingId: string, meetingLink: string, meetingInstructions?: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      meetingLink,
      meetingInstructions,
    },
    include: { user: true, mentor: true }
  });

  await prisma.notification.create({
    data: {
      bookingId,
      userId: booking.userId,
      type: "BOOKING_ACCEPTED",
      message: `🎉 Your booking with ${booking.mentor.name} has been accepted!`,
    },
  });

  return { success: true };
}

export async function rejectBooking(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REJECTED" },
    include: { user: true, mentor: true }
  });

  await prisma.notification.create({
    data: {
      bookingId,
      userId: booking.userId,
      type: "BOOKING_REJECTED",
      message: `Your booking request with ${booking.mentor.name} was declined.`,
    },
  });

  // Handle Refund Logic in the future

  return { success: true };
}

export async function completeSession(bookingId: string, notes: { performance: number, communication: number, problemSolving: number, weakness: string, strength: string, recommendation: string }) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  await prisma.sessionNote.create({
    data: {
      bookingId,
      ...notes,
    }
  });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true }
  });

  if (booking) {
    await prisma.notification.create({
      data: {
        bookingId,
        userId: booking.userId,
        mentorId: booking.mentorId,
        type: "SESSION_COMPLETED",
        message: `Your session with ${booking.mentor.name} has been completed. Check out their notes and generate your AI roadmap!`,
        actionUrl: `/dashboard/bookings/${bookingId}`,
        status: "PENDING",
      }
    });
  }

  return { success: true };
}

// ─── Cancel Booking ──────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  // Check 24h cancellation policy
  const now = new Date();
  const hoursUntilSession =
    (new Date(booking.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);

  const refundable = hoursUntilSession >= 24;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  if (refundable && booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: "REFUNDED" },
    });
  }

  await prisma.notification.create({
    data: {
      bookingId,
      userId: booking.userId,
      mentorId: booking.mentorId,
      type: "BOOKING_CANCELLED",
      message: `A booking on ${booking.date.toDateString()} was cancelled.`,
      status: "PENDING",
    }
  });

  return { success: true, refunded: refundable };
}

// ─── Get Test User (for demo purposes) ──────────────────────────────────────

export async function getTestUser() {
  const user = await prisma.user.findFirst();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function createPendingBooking(data: { mentorId: string; date: string; time: string; duration: number; price: number }) {
  // const session = await getServerSession(authOptions);
  // if (!session || !session.user?.premium) {
  //   throw new Error("Premium required to book");
  // }
  
  // Dummy user creation if needed for testing flow
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { name: "Test User", email: "testuser@example.com" }});
  }
  const userId = user.id;

  const bookingDate = new Date(`${data.date}T${data.time}`);
  const endTime = new Date(bookingDate.getTime() + data.duration * 60000);

  const booking = await prisma.booking.create({
    data: {
      userId,
      mentorId: data.mentorId,
      date: bookingDate,
      startTime: bookingDate,
      endTime,
      status: "PENDING",
      price: data.price,
      payment: {
        create: {
          amount: data.price,
          status: "PENDING"
        }
      },
      notifications: {
        create: {
          mentorId: data.mentorId,
          type: "NEW_BOOKING_REQUEST",
          message: `New session request for ${data.date} at ${data.time}`
        }
      }
    }
  });

  return { success: true, bookingId: booking.id };
}

// ─── AI Roadmap Generation (USP) ─────────────────────────────────────────────

export async function generateSessionSummary(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { sessionNotes: true }
  });

  if (!booking || !booking.sessionNotes) {
    return { success: false, error: "Session notes not found." };
  }

  const { weakness, strength, recommendation } = booking.sessionNotes;

  let aiData = {
    discussionTopics: "Career Growth, Interview Preparation, Resume Review",
    interviewTips: "1. Structure your answers using the STAR method.\n2. Emphasize your impact with numbers.\n3. Keep your introduction under 2 minutes.",
    missingSkills: weakness || "System Design, Advanced SQL, Stakeholder Management",
    projectsToBuild: "1. Build an end-to-end data pipeline using Apache Airflow.\n2. Create a full-stack dashboard for realtime metrics.",
    roadmap: "Month 1: Focus on core algorithms and data structures.\nMonth 2: Build 2 advanced portfolio projects.\nMonth 3: Mock interviews and application blitz.",
    tasks: [
      { title: "Revise Resume according to mentor's notes", daysToComplete: 3 },
      { title: "Complete the System Design primer", daysToComplete: 7 },
      { title: "Schedule next follow-up session", daysToComplete: 14 }
    ]
  };

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Based on the following session notes from a mentor, generate a detailed career roadmap, actionable advice, and 3 follow up tasks.
      Strength: ${strength}
      Weakness: ${weakness}
      Recommendation: ${recommendation}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              discussionTopics: { type: Type.STRING },
              interviewTips: { type: Type.STRING },
              missingSkills: { type: Type.STRING },
              projectsToBuild: { type: Type.STRING },
              roadmap: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    daysToComplete: { type: Type.INTEGER }
                  },
                }
              }
            },
          }
        }
      });
      
      if (response.text) {
        aiData = JSON.parse(response.text);
      }
    } catch (error) {
      console.error("AI Generation failed, falling back to simulated data:", error);
    }
  } else {
    console.warn("GEMINI_API_KEY not found. Using simulated AI data.");
  }

  // 1. Create Session Summary
  const summary = await prisma.sessionSummary.create({
    data: {
      bookingId,
      discussionTopics: aiData.discussionTopics,
      interviewTips: aiData.interviewTips,
      missingSkills: aiData.missingSkills,
      projectsToBuild: aiData.projectsToBuild,
      roadmap: aiData.roadmap,
    }
  });

  // 2. Create Follow-up Tasks (MentorTasks)
  const createdTasks = [];
  for (const task of aiData.tasks) {
    const t = await prisma.mentorTask.create({
      data: {
        bookingId,
        title: task.title,
        deadline: new Date(Date.now() + task.daysToComplete * 24 * 60 * 60 * 1000)
      }
    });
    createdTasks.push(t);
  }

  return { 
    success: true, 
    summary: JSON.parse(JSON.stringify(summary)), 
    tasks: JSON.parse(JSON.stringify(createdTasks)) 
  };
}
