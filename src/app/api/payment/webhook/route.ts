import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(textBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(textBody);

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Find the payment record associated with this order ID
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
        include: { booking: true }
      });

      if (payment && payment.status !== "SUCCESS") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            razorpayPaymentId
          }
        });

        // Ensure booking is marked as PENDING (awaiting mentor approval)
        if (payment.bookingId) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "PENDING" }
          });
          
          await prisma.notification.create({
            data: {
              userId: payment.booking.mentorId,
              type: "NEW_BOOKING_REQUEST",
              message: `You have a new session request awaiting your approval.`,
              bookingId: payment.bookingId
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}
