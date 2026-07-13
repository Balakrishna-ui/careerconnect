import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const isTestMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test";
    
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

    // Generate a mock meeting link
    const meetingLink = `https://meet.google.com/sas-${bookingId.slice(0, 4)}-${bookingId.slice(4, 8)}`;

    const testPaymentId = `TEST_PAY_${Date.now()}`;

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        meetingLink,
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
        message: `[TEST MODE] Your session with ${booking.mentor.name} has been confirmed for ${format(new Date(booking.startTime), "PPP 'at' p")}.`,
        status: "SENT",
      },
    });

    console.log(`[Test Mode] Booking created successfully.`);
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
