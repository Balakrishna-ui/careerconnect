import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executePaymentSuccess } from "@/lib/payment-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      type, // 'PREMIUM_UNLOCK' or 'BOOKING'
      metadata
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
    
    // 1. Verify Razorpay HMAC-SHA256 Signature
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment verification parameters" }, { status: 400 });
    }

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
    
    if (type === "BOOKING") {
      const bookingId = metadata?.bookingId;
      if (!bookingId) {
        return NextResponse.json({ error: "Booking ID is missing from metadata" }, { status: 400 });
      }
      
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, mentor: true }
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Verify user ownership
      if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: You do not own this booking" }, { status: 403 });
      }

      // Idempotency: If already marked SUCCESS, return success gracefully
      if (booking.payment?.status === "SUCCESS") {
        return NextResponse.json({ success: true, message: "Payment already verified" });
      }

      // Execute payment capture, booking transition, and financial ledger entry inside a transaction
      await prisma.$transaction(async (tx) => {
        await executePaymentSuccess(tx, {
          bookingId: booking.id,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          grossAmount: booking.payment?.amount || booking.price,
          userId: booking.userId,
          mentorId: booking.mentorId,
        });
      }, { maxWait: 10000, timeout: 20000 });

      return NextResponse.json({ success: true, message: "Payment verified and recorded in financial ledger." });
    }

    if (type === "PREMIUM_UNLOCK") {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: session.user.id },
          data: { premium: true },
        });

        await tx.subscription.create({
          data: {
            userId: session.user.id,
            plan: "PRO",
            price: 99,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: "ACTIVE",
            billingCycle: "MONTHLY",
            autoRenew: true,
            startDate: new Date(),
          },
        });

        await tx.ledgerEntry.create({
          data: {
            userId: session.user.id,
            type: "SUBSCRIPTION",
            grossAmount: 99,
            platformFee: 99,
            mentorEarnings: 0,
            currency: "INR",
            status: "COMPLETED",
            description: "PRO Subscription Upgrade",
            referenceId: razorpay_payment_id,
          },
        });
      }, { maxWait: 10000, timeout: 20000 });

      return NextResponse.json({ success: true, message: "Upgraded to Pro successfully" });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment", details: error.message },
      { status: 500 }
    );
  }
}
