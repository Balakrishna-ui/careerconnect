"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BookingStateMachine } from "@/lib/booking-state";

export async function acceptBooking(bookingId: string, meetingLink: string, meetingInstructions?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { mentor: true, user: true },
    });

    if (!booking || booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Booking not found or unauthorized" };
    }

    try {
      BookingStateMachine.validateTransition(booking.status, "CONFIRMED");
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // Generate an automatic Google Meet link if none provided
    const finalMeetingLink = meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    // Update booking status, mentor session count, and notification atomically in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          meetingLink: finalMeetingLink,
          meetingInstructions: meetingInstructions || null,
        },
      });
      
      await tx.mentor.update({
        where: { id: booking.mentorId },
        data: { totalSessions: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          bookingId,
          userId: booking.userId,
          mentorId: booking.mentorId,
          type: "BOOKING_ACCEPTED",
          message: `${booking.mentor.name} accepted your booking. Meeting Link is ready.`,
          status: "PENDING",
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath(`/dashboard/bookings`);

    return { success: true };
  } catch (error) {
    console.error("Failed to accept booking:", error);
    return { success: false, error: "Failed to accept booking" };
  }
}

export async function rejectBooking(bookingId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { mentor: true },
    });

    if (!booking || booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Booking not found or unauthorized" };
    }

    try {
      BookingStateMachine.validateTransition(booking.status, "REJECTED");
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // Atomic transaction for rejection update and notification
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "REJECTED",
        },
      });

      await tx.notification.create({
        data: {
          bookingId,
          userId: booking.userId,
          mentorId: booking.mentorId,
          type: "BOOKING_REJECTED",
          message: `Your booking with ${booking.mentor.name} was declined. ${reason ? `Reason: ${reason}` : ''}`,
          status: "PENDING",
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    // If payment exists and is captured, trigger refund logic
    // For MVL, we just update the DB. Actual Razorpay refund API should be called here.

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath(`/dashboard/bookings`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reject booking:", error);
    return { success: false, error: "Failed to reject booking" };
  }
}

export async function getMentorBookingsAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "MENTOR") {
      return [];
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentor) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: { mentorId: mentor.id },
      include: {
        user: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
            projects: true,
          },
        },
        payment: true,
        rescheduleReq: true,
        cancellationReq: true,
      },
      orderBy: { date: "desc" },
    });

    return JSON.parse(JSON.stringify(bookings));
  } catch (error) {
    console.error("Failed to fetch mentor bookings:", error);
    return [];
  }
}

