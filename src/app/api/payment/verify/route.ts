import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    
    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    if (type === "BOOKING") {
      const { bookingId } = metadata;
      
      const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: { booking: true }
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      if (payment.status === "SUCCESS") {
        // Prevent duplicate callbacks from creating issues
        return NextResponse.json({ success: true, message: "Payment already verified" });
      }

      // Update payment record
      await prisma.payment.update({
        where: { bookingId },
        data: {
          status: "SUCCESS",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        }
      });
      
      // Update booking status from AWAITING_PAYMENT to PENDING (pending mentor approval)
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "PENDING" }
      });

      // (Optional) We can create a notification for the Mentor here
      await prisma.notification.create({
        data: {
          userId: payment.booking.mentorId, // For now sending to mentor
          type: "NEW_BOOKING_REQUEST",
          message: `You have a new session request for ${new Date(payment.booking.date).toLocaleDateString()}.`,
          bookingId: bookingId
        }
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    }

    if (type === "PREMIUM_UNLOCK") {
      // Update User premium status
      await prisma.user.update({
        where: { id: session.user.id },
        data: { premium: true }
      });

      // Create Subscription Record
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "PRO",
          price: 99,
          active: true,
          startDate: new Date(),
        }
      });

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
