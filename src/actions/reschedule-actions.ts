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
  reason?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
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

    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return { success: false, error: "Cannot reschedule a cancelled or completed booking" };
    }

    if (new Date(booking.startTime) < new Date()) {
      return { success: false, error: "Cannot reschedule a session that has already started or passed." };
    }

    // @ts-ignore - Prisma client needs to be re-generated on server restart
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

    // Verify slot is available
    const duration = Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / 60000);
    const slots = await getAvailableSlots(booking.mentorId, data.requestedDate, duration);
    const slot = slots.find((s) => s.start === data.requestedTime && s.available);

    if (!slot) {
      return { success: false, error: "The requested time slot is no longer available." };
    }

    const rescheduleReq = await prisma.rescheduleRequest.create({
      data: {
        bookingId: booking.id,
        mentorId: booking.mentorId,
        jobSeekerId: booking.userId,
        oldDate: booking.date,
        oldStartTime: booking.startTime,
        requestedDate: startOfDay(date),
        requestedTime: requestedStart,
        reason: data.reason,
      },
    });

    // Notify Mentor
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        mentorId: booking.mentorId,
        type: "RESCHEDULE_REQUEST",
        message: `${booking.user.name} wants to reschedule your session from ${format(new Date(booking.startTime), "PPP 'at' p")} to ${format(new Date(requestedStart), "PPP 'at' p")}.`,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/mentor/dashboard");
    revalidatePath(`/dashboard/bookings/${booking.id}`);

    return { success: true, rescheduleReq };
  } catch (error) {
    console.error("Failed to create reschedule request:", error);
    return { success: false, error: "Something went wrong." };
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

    if (!request || request.mentorId !== session.user.id) {
      return { success: false, error: "Request not found or unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is no longer pending." };
    }

    const duration = Math.round((request.booking.endTime.getTime() - request.booking.startTime.getTime()) / 60000);
    const newEndTime = addMinutes(request.requestedTime, duration);

    // Update Request
    await prisma.rescheduleRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // Update Booking
    await prisma.booking.update({
      where: { id: request.bookingId },
      data: {
        date: request.requestedDate,
        startTime: request.requestedTime,
        endTime: newEndTime,
      },
    });

    // Notify Job Seeker
    await prisma.notification.create({
      data: {
        bookingId: request.bookingId,
        userId: request.jobSeekerId,
        type: "RESCHEDULE_ACCEPTED",
        message: `Your mentor ${request.booking.mentor.name} accepted your reschedule request. New session: ${format(new Date(request.requestedTime), "PPP 'at' p")}.`,
      },
    });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/bookings/${request.bookingId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to accept reschedule:", error);
    return { success: false, error: "Failed to accept reschedule" };
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

    if (!request || request.mentorId !== session.user.id) {
      return { success: false, error: "Request not found or unauthorized" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is no longer pending." };
    }

    // Update Request
    await prisma.rescheduleRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    // Notify Job Seeker
    await prisma.notification.create({
      data: {
        bookingId: request.bookingId,
        userId: request.jobSeekerId,
        type: "RESCHEDULE_REJECTED",
        message: `Your mentor ${request.booking.mentor.name} rejected the reschedule request. Your original session time remains.`,
      },
    });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/bookings/${request.bookingId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reject reschedule:", error);
    return { success: false, error: "Failed to reject reschedule" };
  }
}
