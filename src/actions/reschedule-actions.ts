// @ts-nocheck
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format, parseISO, startOfDay, addMinutes } from "date-fns";
import { getAvailableSlots } from "@/actions/booking-actions";

export async function createRescheduleRequest(data: {
  bookingId: string;
  requestedDate: string; // "YYYY-MM-DD"
  requestedTime: string; // "HH:mm"
  reason: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!data.reason || !data.reason.trim()) {
      return { success: false, error: "A reason explaining why you need to reschedule is required." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        mentor: { include: { user: true } },
        user: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.userId !== session.user.id) {
      return { success: false, error: "Unauthorized to reschedule this booking" };
    }

    if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
      return { success: false, error: "Cannot reschedule a cancelled or declined booking" };
    }

    // Check if a pending reschedule request already exists
    const existingRequest = await prisma.rescheduleRequest.findFirst({
      where: {
        bookingId: booking.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return { success: false, error: "A reschedule request is already pending for this booking." };
    }

    // Parse requested date/time
    const date = parseISO(data.requestedDate);
    const [h, m] = data.requestedTime.split(":").map(Number);
    const requestedStart = new Date(date);
    requestedStart.setHours(h, m, 0, 0);

    // Server-side past time protection
    if (requestedStart < new Date()) {
      return { success: false, error: "Cannot reschedule to a past date/time." };
    }

    // Verify slot is available with the mentor
    const duration = Math.max(15, Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000) || 60);
    const slots = await getAvailableSlots(booking.mentorId, data.requestedDate, duration);
    const slot = slots.find((s) => s.start === data.requestedTime && s.available);

    if (!slot) {
      return { success: false, error: "The requested time slot is no longer available." };
    }

    const requestedEnd = addMinutes(requestedStart, duration);

    // Create or update RescheduleRequest and notification atomically inside an interactive transaction with Advisory Lock
    const rescheduleReq = await prisma.$transaction(async (tx) => {
      // 1. Acquire transaction-level advisory lock on the mentor
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${booking.mentorId}))`;

      // 2. Re-verify conflict inside the locked transaction
      const txConflict = await tx.booking.findFirst({
        where: {
          mentorId: booking.mentorId,
          id: { not: booking.id },
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: requestedEnd },
          endTime: { gt: requestedStart },
        },
      });

      if (txConflict) {
        throw new Error("This time slot conflicts with another scheduled booking.");
      }

      const req = await tx.rescheduleRequest.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          mentorId: booking.mentorId,
          jobSeekerId: booking.userId,
          oldDate: booking.date,
          oldStartTime: booking.startTime,
          requestedDate: startOfDay(date),
          requestedTime: requestedStart,
          reason: data.reason.trim(),
          status: "PENDING",
        },
        update: {
          oldDate: booking.date,
          oldStartTime: booking.startTime,
          requestedDate: startOfDay(date),
          requestedTime: requestedStart,
          reason: data.reason.trim(),
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          bookingId: booking.id,
          mentorId: booking.mentorId,
          userId: booking.userId,
          type: "RESCHEDULE_REQUEST",
          message: `${booking.user?.name || "Job Seeker"} requested to reschedule their session to ${format(requestedStart, "PPP 'at' p")}. Reason: ${data.reason.trim()}`,
        },
      });

      return req;
    }, { maxWait: 10000, timeout: 20000 });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath(`/dashboard/bookings/${booking.id}`);

    return { success: true, rescheduleReq };
  } catch (error: any) {
    console.error("Failed to create reschedule request:", error);
    return { success: false, error: error?.message || "Something went wrong." };
  }
}

export async function acceptRescheduleRequest(requestId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const request = await prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        booking: { include: { user: true, mentor: true } },
      },
    });

    if (!request || request.booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Request not found or unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is no longer pending." };
    }

    const duration = Math.max(15, Math.round((new Date(request.booking.endTime).getTime() - new Date(request.booking.startTime).getTime()) / 60000) || 60);
    const newEndTime = addMinutes(new Date(request.requestedTime), duration);

    // Atomic transaction with Advisory Lock for conflict check, reschedule acceptance, and booking schedule update
    await prisma.$transaction(async (tx) => {
      // 1. Acquire transaction-level advisory lock on the mentor
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${request.mentorId}))`;

      // 2. Re-verify conflict inside the locked transaction
      const conflict = await tx.booking.findFirst({
        where: {
          mentorId: request.mentorId,
          id: { not: request.bookingId },
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: newEndTime },
          endTime: { gt: new Date(request.requestedTime) },
        },
      });

      if (conflict) {
        throw new Error("Cannot accept: This slot is now booked by another session.");
      }

      // 3. Update Request to ACCEPTED
      await tx.rescheduleRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // 4. Update Booking with new schedule and CONFIRMED status
      await tx.booking.update({
        where: { id: request.bookingId },
        data: {
          date: request.requestedDate,
          startTime: request.requestedTime,
          endTime: newEndTime,
          status: "CONFIRMED",
        },
      });

      // 5. Notify Job Seeker
      await tx.notification.create({
        data: {
          bookingId: request.bookingId,
          userId: request.jobSeekerId,
          mentorId: request.mentorId,
          type: "RESCHEDULE_ACCEPTED",
          message: `Your mentor ${request.booking.mentor.name} accepted your reschedule request. New session: ${format(new Date(request.requestedTime), "PPP 'at' p")}.`,
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${request.bookingId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to accept reschedule:", error);
    return { success: false, error: error?.message || "Failed to accept reschedule" };
  }
}

export async function rejectRescheduleRequest(requestId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const request = await prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        booking: { include: { user: true, mentor: true } },
      },
    });

    if (!request || request.booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Request not found or unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is no longer pending." };
    }

    // Atomic transaction for rejection update and notification
    await prisma.$transaction(async (tx) => {
      await tx.rescheduleRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      await tx.notification.create({
        data: {
          bookingId: request.bookingId,
          userId: request.jobSeekerId,
          mentorId: request.mentorId,
          type: "RESCHEDULE_REJECTED",
          message: `Your mentor ${request.booking.mentor.name} declined the reschedule request.`,
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${request.bookingId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject reschedule:", error);
    return { success: false, error: error?.message || "Failed to reject reschedule" };
  }
}
