import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    // Force test mode
    const isTestMode = true; // process.env.NEXT_PUBLIC_PAYMENT_MODE === "test";
    
    if (!isTestMode) {
      return NextResponse.json(
        { error: "Test mode is not enabled" },
        { status: 403 }
      );
    }

    const { test_order_id, metadata } = await req.json();
    const bookingId = metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const testPaymentId = `TEST_PAY_${Date.now()}`;

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "PENDING",
      },
      include: {
        mentor: true,
        user: true,
      },
    });

    // Update payment
    await prisma.payment.update({
      where: { bookingId },
      data: {
        razorpayPaymentId: testPaymentId,
        status: "SUCCESS",
      },
    });

    // Create notification for Mentor
    await prisma.notification.create({
      data: {
        bookingId,
        userId: booking.userId,
        mentorId: booking.mentorId,
        type: "NEW_BOOKING_REQUEST",
        message: `[TEST MODE] You have a new session request from ${booking.user.name} for ${format(new Date(booking.startTime), "PPP 'at' p")}.`,
        status: "PENDING",
      },
    });

    console.log(`[Test Mode] Booking request created successfully.`);
    console.log(`[Test Mode] Booking ID: ${bookingId}`);
    console.log(`[Test Mode] Mentor: ${booking.mentor.name}`);
    console.log(`[Test Mode] Job Seeker: ${booking.user.name}`);

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error("Test Verification error:", error);
    return NextResponse.json(
      { error: "Test Verification failed" },
      { status: 500 }
    );
  }
}
