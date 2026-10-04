import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executePaymentSuccess } from "@/lib/payment-service";

export async function POST(req: NextRequest) {
  try {
    // Prohibit in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Forbidden: Test verification endpoint is permanently disabled in production." },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { test_order_id, metadata } = await req.json();
    const bookingId = metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const testPaymentId = `TEST_PAY_${Date.now()}`;

    // Execute atomic payment and ledger update
    await prisma.$transaction(async (tx) => {
      await executePaymentSuccess(tx, {
        bookingId,
        razorpayPaymentId: testPaymentId,
        razorpayOrderId: test_order_id || `test_order_${Date.now()}`,
        grossAmount: booking.payment?.amount || booking.price,
        userId: booking.userId,
        mentorId: booking.mentorId,
      });
    }, { maxWait: 10000, timeout: 20000 });

    return NextResponse.json({ success: true, bookingId });
  } catch (error: any) {
    console.error("Test Verification error:", error);
    return NextResponse.json(
      { error: "Test Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
