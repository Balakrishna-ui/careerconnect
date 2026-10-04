"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingStateMachine } from "@/lib/booking-state";

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
  try {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const targetMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

    const [mentor, blockedDates] = await Promise.all([
      prisma.mentor.findUnique({
        where: { id: mentorId },
        include: { settings: true, weeklySchedules: true },
      }),
      prisma.blockedDate.findMany({
        where: {
          mentorId,
          date: {
            gte: new Date(year, month, 1),
            lte: new Date(year, month, daysInMonth, 23, 59, 59),
          },
        },
      }),
    ]);

    const blockedSet = new Set(
      blockedDates.map((bd) => format(new Date(bd.date), "yyyy-MM-dd"))
    );

    let weeklySchedules = mentor?.weeklySchedules?.filter((ws: any) => ws.isAvailable) || [];
    if (weeklySchedules.length === 0) {
      weeklySchedules = [1, 2, 3, 4, 5].map((d) => ({
        id: `default-${d}`,
        mentorId: mentorId,
        dayOfWeek: d,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      })) as any;
    }

    const availableDaysOfWeek = new Set(weeklySchedules.map((ws) => ws.dayOfWeek));
    const result: AvailableDate[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dow = dateObj.getDay();
      const dateStr = `${targetMonthPrefix}-${String(day).padStart(2, "0")}`;

      if (availableDaysOfWeek.has(dow) && !blockedSet.has(dateStr)) {
        result.push({
          date: dateStr,
          dayOfWeek: dow,
          slotsCount: 6,
        });
      }
    }

    return result;
  } catch (err) {
    console.error("Error in getAvailableDates:", err);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const targetMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const result: AvailableDate[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dow = dateObj.getDay();
      if (dow >= 1 && dow <= 5) {
        result.push({
          date: `${targetMonthPrefix}-${String(day).padStart(2, "0")}`,
          dayOfWeek: dow,
          slotsCount: 6,
        });
      }
    }
    return result;
  }
}

// ─── Get Available Time Slots for a Specific Date ────────────────────────────

export async function getAvailableSlots(
  mentorId: string,
  dateStr: string,
  sessionDuration: number = 60,
  userTimeZone: string = "UTC"
): Promise<TimeSlot[]> {
  try {
    const date = parseISO(dateStr); // "YYYY-MM-DD"
    const dayOfWeek = date.getDay();

    const [mentor, blockedDate, existingBookings] = await Promise.all([
      prisma.mentor.findUnique({
        where: { id: mentorId },
        include: { settings: true, weeklySchedules: true },
      }),
      prisma.blockedDate.findFirst({
        where: {
          mentorId,
          date: {
            gte: startOfDay(date),
            lt: addDays(startOfDay(date), 1),
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          mentorId,
          status: { in: ["PENDING", "CONFIRMED", "AWAITING_PAYMENT"] },
          date: {
            gte: startOfDay(date),
            lt: addDays(startOfDay(date), 1),
          },
          NOT: {
            status: "AWAITING_PAYMENT",
            createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) }, // Stale abandoned payments (>15m) are ignored
          },
        },
      }),
    ]);

    // If date is explicitly blocked by mentor, no slots are available
    if (blockedDate) {
      return [];
    }

    let weeklySchedules = mentor?.weeklySchedules?.filter((ws: any) => ws.isAvailable) || [];
    if (weeklySchedules.length === 0) {
      weeklySchedules = [1, 2, 3, 4, 5].map((d) => ({
        id: `default-${d}`,
        mentorId: mentorId,
        dayOfWeek: d,
        startTime: "09:00",
        endTime: "18:00",
        isAvailable: true,
      })) as any;
    }

    const schedule = weeklySchedules.find((s: any) => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isAvailable) return [];

    const duration = Math.max(15, Number(sessionDuration) || 60);
    const bufferTime = mentor?.settings?.bufferTime ?? 0;
    const stepMinutes = Math.min(30, duration); // 30-min grid alignment

    const [startH, startM] = (schedule.startTime || "09:00").split(":").map(Number);
    const [endH, endM] = (schedule.endTime || "18:00").split(":").map(Number);

    const scheduleStartMinutes = startH * 60 + startM;
    const scheduleEndMinutes = endH * 60 + endM;

    const candidateSlots: { start: string; end: string; startUtc: Date; endUtc: Date }[] = [];

    for (let cur = scheduleStartMinutes; cur + duration <= scheduleEndMinutes; cur += (duration >= 60 ? 60 : 30)) {
      const slotStartH = Math.floor(cur / 60);
      const slotStartM = cur % 60;
      const slotEndH = Math.floor((cur + duration) / 60);
      const slotEndM = (cur + duration) % 60;

      const startStr = `${String(slotStartH).padStart(2, "0")}:${String(slotStartM).padStart(2, "0")}`;
      const endStr = `${String(slotEndH).padStart(2, "0")}:${String(slotEndM).padStart(2, "0")}`;

      const slotStartUtc = fromZonedTime(`${dateStr}T${startStr}:00`, userTimeZone);
      const slotEndUtc = addMinutes(slotStartUtc, duration);

      candidateSlots.push({
        start: startStr,
        end: endStr,
        startUtc: slotStartUtc,
        endUtc: slotEndUtc,
      });
    }

    const now = new Date();

    const slots: TimeSlot[] = candidateSlots.map((cand) => {
      // 1. Past time check: Slot must be in future
      const isPast = isBefore(cand.startUtc, now);

      // 2. Interval overlap check with existing active bookings
      const hasConflict = existingBookings.some((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return bStart < cand.endUtc && bEnd > cand.startUtc;
      });

      return {
        start: cand.start,
        end: cand.end,
        available: !isPast && !hasConflict,
      };
    });

    return slots;
  } catch (err) {
    console.error("Error in getAvailableSlots:", err);
    return [];
  }
}

// ─── Create a Booking ────────────────────────────────────────────────────────

export async function createBooking(data: {
  mentorId: string;
  userId?: string;
  serviceId: string;
  dateStr: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  userTimeZone?: string;
  goal?: string;
  experience?: string;
  message?: string;
  resumeUrl?: string;
}) {
  const { mentorId, serviceId, dateStr, startTime, userTimeZone = "UTC", goal, experience, message, resumeUrl } = data;

  // Verify authenticated session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to book a session." };
  }
  const authenticatedUserId = session.user.id;

  // Get service
  const service = await prisma.sessionType.findUnique({
    where: { id: serviceId }
  });
  if (!service || service.mentorId !== mentorId) {
    return { success: false, error: "Invalid service selected." };
  }

  // Get mentor
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { settings: true },
  });

  if (!mentor) {
    return { success: false, error: "Mentor not found." };
  }

  if (mentor.applicationStatus !== "VERIFIED") {
    return { success: false, error: "This mentor is not verified and cannot accept bookings." };
  }

  const sessionDuration = service.duration;
  
  // Construct the booked time in UTC based on the user's timezone selection
  const userDateTimeStr = `${dateStr}T${startTime}:00`;
  const bookingStart = fromZonedTime(userDateTimeStr, userTimeZone);
  const bookingEnd = addMinutes(bookingStart, sessionDuration);

  // Server-side past time protection
  if (isBefore(bookingStart, new Date())) {
    return { success: false, error: "Cannot book a time slot in the past. Please select a future time slot." };
  }

  try {
    let orderId: string | null = null;
    const initialStatus = service.price <= 0 ? "PENDING" : "AWAITING_PAYMENT";

    // 1. Atomic conflict check + creation inside an interactive transaction with PostgreSQL Advisory Lock
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Acquire transaction-level advisory lock on the mentor to serialize concurrent slot reservations for this mentor
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${mentorId}))`;

      // 2. Check for overlapping active bookings for the same mentor
      const conflict = await tx.booking.findFirst({
        where: {
          mentorId,
          status: { in: ["AWAITING_PAYMENT", "PENDING", "CONFIRMED"] },
          startTime: { lt: bookingEnd },
          endTime: { gt: bookingStart },
          NOT: {
            status: "AWAITING_PAYMENT",
            createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) }, // Stale abandoned payments (>15m) are ignored
          },
        },
      });

      if (conflict) {
        throw new Error("This time slot was just booked by another user. Please choose another slot.");
      }

      // 3. Create the booking record
      const createdBooking = await tx.booking.create({
        data: {
          userId: authenticatedUserId,
          mentorId,
          date: startOfDay(bookingStart),
          startTime: bookingStart,
          endTime: bookingEnd,
          status: initialStatus,
          price: service.price,
          sessionTitle: service.title,
          goal,
          experience,
          message,
          resumeUrl,
        },
      });

      // 4. Create initial payment record atomically
      await tx.payment.create({
        data: {
          bookingId: createdBooking.id,
          amount: service.price,
          currency: "INR",
          status: service.price <= 0 ? "SUCCESS" : "PENDING",
        },
      });

      return createdBooking;
    }, { maxWait: 10000, timeout: 20000 });

    // 2. External Payment Order Initialization (Executed outside the DB transaction)
    if (service.price <= 0) {
      orderId = `free_${booking.id}`;
    } else {
      try {
        const receipt = `rcpt_${booking.id.slice(0, 16)}_${Date.now().toString().slice(-8)}`;
        const order = await razorpay.orders.create({
          amount: service.price * 100,
          currency: "INR",
          receipt,
          notes: {
            bookingId: booking.id,
            userId: authenticatedUserId,
            mentorId,
          },
        });
        orderId = order.id;
      } catch (error) {
        console.warn("Razorpay API call failed during order creation, using fallback reference:", error);
        orderId = `order_${booking.id.slice(0, 12)}_${Date.now()}`;
      }
    }

    // 3. Update payment with the generated order ID
    if (orderId) {
      await prisma.payment.updateMany({
        where: { bookingId: booking.id },
        data: { razorpayOrderId: orderId },
      });
    }

    return {
      success: true,
      bookingId: booking.id,
      razorpayOrderId: orderId,
      amount: service.price,
    };
  } catch (error: any) {
    console.error("createBooking error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create booking.",
    };
  }
}

// ─── Confirm Booking (after payment) ─────────────────────────────────────────

export async function confirmBooking(data: {
  bookingId: string;
  razorpayPaymentId: string;
}) {
  const { bookingId, razorpayPaymentId } = data;

  const existingBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true },
  });

  if (!existingBooking) {
    return { success: false, error: "Booking not found." };
  }

  // Idempotent: If already confirmed or pending approval, return current state
  if (existingBooking.status === "PENDING" || existingBooking.status === "CONFIRMED") {
    return {
      success: true,
      booking: JSON.parse(JSON.stringify(existingBooking)),
      meetingLink: existingBooking.meetingLink || "Pending Mentor Approval",
    };
  }

  // Validate state machine transition
  try {
    BookingStateMachine.validateTransition(existingBooking.status, "PENDING");
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  // Execute database updates atomically in an interactive transaction
  const booking = await prisma.$transaction(async (tx) => {
    // 1. Update booking status
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "PENDING", // PENDING Mentor Approval
      },
      include: {
        mentor: true,
      },
    });

    // 2. Update payment status
    await tx.payment.update({
      where: { bookingId },
      data: {
        razorpayPaymentId,
        status: "SUCCESS",
      },
    });

    // 3. Update mentor total sessions
    await tx.mentor.update({
      where: { id: updatedBooking.mentorId },
      data: { totalSessions: { increment: 1 } },
    });

    // 4. Create notification for job seeker
    await tx.notification.create({
      data: {
        bookingId,
        userId: updatedBooking.userId,
        mentorId: updatedBooking.mentorId,
        type: "EMAIL",
        message: `Your booking request with ${updatedBooking.mentor.name} has been sent and is awaiting approval.`,
        status: "SENT",
      },
    });

    return updatedBooking;
  }, { maxWait: 10000, timeout: 20000 });

  // Trigger Pusher event to alert the mentor in real-time
  try {
    await pusherServer.trigger(
      `mentor-${booking.mentorId}`,
      "new-booking",
      { bookingId: booking.id }
    );
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }

  return {
    success: true,
    booking: JSON.parse(JSON.stringify(booking)),
    meetingLink: "Pending Mentor Approval",
  };
}

// ─── Mentor Lifecycle Actions ────────────────────────────────────────────────

export async function acceptBooking(bookingId: string, meetingLink: string, meetingInstructions?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MENTOR") {
    return { success: false, error: "Unauthorized. Mentor login required." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true, user: true },
  });

  if (!booking || booking.mentor.userId !== session.user.id) {
    return { success: false, error: "Booking not found or unauthorized." };
  }

  // Idempotency: If already confirmed, return success
  if (booking.status === "CONFIRMED") {
    return { success: true };
  }

  try {
    BookingStateMachine.validateTransition(booking.status, "CONFIRMED");
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  const finalMeetingLink = meetingLink || `https://meet.google.com/sas-${bookingId.slice(0, 4)}-${bookingId.slice(4, 8)}`;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        meetingLink: finalMeetingLink,
        meetingInstructions: meetingInstructions || null,
      },
      include: { user: true, mentor: true }
    });

    await tx.notification.create({
      data: {
        bookingId,
        userId: updated.userId,
        type: "BOOKING_ACCEPTED",
        message: `🎉 Your booking with ${updated.mentor.name} has been accepted!`,
      },
    });

    return updated;
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true };
}

export async function rejectBooking(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MENTOR") {
    return { success: false, error: "Unauthorized. Mentor login required." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true, user: true },
  });

  if (!booking || booking.mentor.userId !== session.user.id) {
    return { success: false, error: "Booking not found or unauthorized." };
  }

  // Idempotency: If already rejected, return success
  if (booking.status === "REJECTED") {
    return { success: true };
  }

  try {
    BookingStateMachine.validateTransition(booking.status, "REJECTED");
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" },
      include: { user: true, mentor: true }
    });

    await tx.notification.create({
      data: {
        bookingId,
        userId: updated.userId,
        type: "BOOKING_REJECTED",
        message: `Your booking request with ${updated.mentor.name} was declined.`,
      },
    });

    return updated;
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true };
}

export async function completeSession(bookingId: string, notes: { performance: number, communication: number, problemSolving: number, weakness: string, strength: string, recommendation: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MENTOR") {
    return { success: false, error: "Unauthorized. Mentor login required." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true },
  });

  if (!booking || booking.mentor.userId !== session.user.id) {
    return { success: false, error: "Booking not found or unauthorized." };
  }

  // Idempotency: If already completed, return success
  if (booking.status === "COMPLETED") {
    return { success: true };
  }

  try {
    BookingStateMachine.validateTransition(booking.status, "COMPLETED");
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
      include: { mentor: true }
    });

    await tx.sessionNote.create({
      data: {
        bookingId,
        ...notes,
      }
    });

    await tx.notification.create({
      data: {
        bookingId,
        userId: updated.userId,
        mentorId: updated.mentorId,
        type: "SESSION_COMPLETED",
        message: `Your session with ${updated.mentor.name} has been completed. Check out their notes and generate your AI roadmap!`,
        actionUrl: `/dashboard/bookings/${bookingId}`,
        status: "PENDING",
      }
    });
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true };
}

// ─── Cancel Booking ──────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, mentor: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  // Authorization check: Only booked user or mentor can cancel
  if (booking.userId !== session.user.id && booking.mentor.userId !== session.user.id) {
    return { success: false, error: "Unauthorized to cancel this booking." };
  }

  // Idempotency: If already cancelled, return success
  if (booking.status === "CANCELLED") {
    return { success: true, message: "Booking is already cancelled.", refunded: false };
  }

  // State machine validation
  try {
    BookingStateMachine.validateTransition(booking.status, "CANCELLED");
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  // Check 24h cancellation policy
  const now = new Date();
  const hoursUntilSession =
    (new Date(booking.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);

  const refundable = hoursUntilSession >= 24;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (refundable && booking.payment) {
      await tx.payment.update({
        where: { id: booking.payment.id },
        data: { status: "REFUNDED" },
      });
    }

    await tx.notification.create({
      data: {
        bookingId,
        userId: booking.userId,
        mentorId: booking.mentorId,
        type: "BOOKING_CANCELLED",
        message: `A booking on ${booking.date.toDateString()} was cancelled.`,
        status: "PENDING",
      }
    });
  }, { maxWait: 10000, timeout: 20000 });

  return { success: true, refunded: refundable };
}

// ─── Get Test User (for demo purposes) ──────────────────────────────────────

export async function getTestUser() {
  const user = await prisma.user.findFirst();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function createPendingBooking(data: { mentorId: string; date: string; time: string; duration: number; price: number; title?: string }) {
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
      sessionTitle: data.title || "1:1 Mentorship Session",
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

  // Trigger Pusher event to alert the mentor in real-time
  try {
    await pusherServer.trigger(
      `mentor-${data.mentorId}`,
      "new-booking",
      { bookingId: booking.id }
    );
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }

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

// ─── Get Realtime Job Seeker Bookings ─────────────────────────────────────────

export async function getJobSeekerBookingsAction(userId?: string) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) return [];

    // Transition any past uncompleted confirmed sessions to MISSED
    const now = new Date();
    try {
      await prisma.booking.updateMany({
        where: {
          userId: targetUserId,
          status: "CONFIRMED",
          endTime: { lt: now },
        },
        data: {
          status: "MISSED",
        },
      });
    } catch (err) {
      console.error("Failed to auto-transition missed bookings:", err);
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: targetUserId },
      include: {
        mentor: true,
        rescheduleReq: true,
        cancellationReq: true,
        payment: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      mentorId: b.mentorId,
      mentorName: b.mentor?.name || "Mentor",
      mentorImage: b.mentor?.image || null,
      mentorRole: b.mentor?.role || "Mentor",
      mentorCompany: b.mentor?.company || "Independent",
      sessionTitle: b.sessionTitle || "1:1 Mentorship Session",
      date: b.date ? new Date(b.date).toISOString() : new Date().toISOString(),
      startTime: b.startTime ? new Date(b.startTime).toISOString() : new Date().toISOString(),
      endTime: b.endTime ? new Date(b.endTime).toISOString() : new Date().toISOString(),
      status: b.status,
      price: b.price,
      meetingLink: b.meetingLink,
      rescheduleReq: b.rescheduleReq
        ? {
            id: b.rescheduleReq.id,
            status: b.rescheduleReq.status,
            requestedDate: b.rescheduleReq.requestedDate ? new Date(b.rescheduleReq.requestedDate).toISOString() : new Date().toISOString(),
            requestedTime: b.rescheduleReq.requestedTime ? new Date(b.rescheduleReq.requestedTime).toISOString() : new Date().toISOString(),
            reason: b.rescheduleReq.reason,
          }
        : null,
      cancellationReq: b.cancellationReq
        ? {
            id: b.cancellationReq.id,
            status: b.cancellationReq.status,
            reason: b.cancellationReq.reason,
            refundAmount: b.cancellationReq.refundAmount,
            createdAt: b.cancellationReq.createdAt ? new Date(b.cancellationReq.createdAt).toISOString() : new Date().toISOString(),
          }
        : null,
    }));
  } catch (error) {
    console.error("getJobSeekerBookingsAction error:", error);
    return [];
  }
}
