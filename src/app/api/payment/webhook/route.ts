import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { executePaymentSuccess, executeRefund } from "@/lib/payment-service";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

    // Verify HMAC-SHA256 signature against raw unparsed body
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(textBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(textBody);
    const eventId = event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const eventType = event.event;

    // Webhook Idempotency: Check if this event was already processed
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.processed) {
      return NextResponse.json({ success: true, message: "Webhook already processed (idempotent response)" });
    }

    // Save event record
    await prisma.webhookEvent.upsert({
      where: { eventId },
      update: {},
      create: {
        eventId,
        eventType,
        payload: textBody,
        processed: false,
      },
    });

    // Handle payment.captured
    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity) {
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const grossAmount = Math.round((paymentEntity.amount || 0) / 100);

        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
          include: { booking: true },
        });

        if (payment && payment.status !== "SUCCESS") {
          await prisma.$transaction(async (tx) => {
            await executePaymentSuccess(tx, {
              bookingId: payment.bookingId,
              razorpayPaymentId,
              razorpayOrderId,
              grossAmount: payment.amount || grossAmount,
              userId: payment.booking.userId,
              mentorId: payment.booking.mentorId,
            });
          }, { maxWait: 10000, timeout: 20000 });
        }
      }
    }

    // Handle payment.failed
    if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity) {
        const razorpayOrderId = paymentEntity.order_id;
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
        });

        if (payment && payment.status === "PENDING") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
        }
      }
    }

    // Handle refund.processed
    if (eventType === "refund.processed") {
      const refundEntity = event.payload?.refund?.entity;
      if (refundEntity) {
        const razorpayPaymentId = refundEntity.payment_id;
        const refundAmount = Math.round((refundEntity.amount || 0) / 100);
        const razorpayRefundId = refundEntity.id;

        const payment = await prisma.payment.findFirst({
          where: { razorpayPaymentId },
          include: { booking: true },
        });

        if (payment) {
          await prisma.$transaction(async (tx) => {
            await executeRefund(tx, {
              paymentId: payment.id,
              bookingId: payment.bookingId,
              refundAmount,
              reason: "Refund processed via Razorpay webhook",
              razorpayRefundId,
              userId: payment.booking?.userId,
              mentorId: payment.booking?.mentorId,
            });
          }, { maxWait: 10000, timeout: 20000 });
        }
      }
    }

    // Mark webhook event as processed
    await prisma.webhookEvent.update({
      where: { eventId },
      data: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}
