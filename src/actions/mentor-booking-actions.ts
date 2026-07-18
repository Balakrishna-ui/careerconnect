"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

    if (booking.status !== "PENDING") {
      return { success: false, error: "Only pending bookings can be accepted" };
    }

    // Update booking status and meeting link
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        meetingLink: meetingLink,
        meetingInstructions: meetingInstructions || null,
      },
    });
    
    // Update mentor total sessions
    await prisma.mentor.update({
      where: { id: booking.mentorId },
      data: { totalSessions: { increment: 1 } },
    });

    // Notify Job Seeker
    await prisma.notification.create({
      data: {
        bookingId,
        userId: booking.userId,
        mentorId: booking.mentorId,
        type: "BOOKING_ACCEPTED",
        message: `${booking.mentor.name} accepted your booking. Meeting Link is ready.`,
        status: "PENDING",
      },
    });

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

    if (booking.status !== "PENDING") {
      return { success: false, error: "Only pending bookings can be rejected" };
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "REJECTED",
      },
    });

    // Notify Job Seeker
    await prisma.notification.create({
      data: {
        bookingId,
        userId: booking.userId,
        mentorId: booking.mentorId,
        type: "BOOKING_REJECTED",
        message: `Your booking with ${booking.mentor.name} was declined. ${reason ? `Reason: ${reason}` : ''}`,
        status: "PENDING",
      },
    });

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

