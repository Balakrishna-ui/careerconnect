import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, type = "BOOKING" } = body;

    if (type === "BOOKING") {
      if (!bookingId) {
        return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
      }

      // Look up booking from database - NEVER trust client-provided amount
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, mentor: true },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Verify booking belongs to authenticated user
      if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: You do not own this booking" }, { status: 403 });
      }

      // Verify booking is in payable state
      if (booking.status !== "AWAITING_PAYMENT") {
        return NextResponse.json(
          { error: `Booking is in ${booking.status} state and cannot be paid.` },
          { status: 400 }
        );
      }

      // Free discovery session handling
      if (booking.price <= 0) {
        return NextResponse.json({
          id: `free_booking_${booking.id}`,
          amount: 0,
          currency: "INR",
          status: "free",
        });
      }

      // Calculate amount in paise (1 INR = 100 paise)
      let finalAmount = booking.price;
      if (session.user.premium) {
        finalAmount = Math.max(0, Math.round(booking.price * 0.9));
      }

      const amountInPaise = finalAmount * 100;
      const receipt = `rcpt_${booking.id.slice(0, 16)}_${Date.now().toString().slice(-8)}`;

      // Create order via Razorpay API
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          bookingId: booking.id,
          userId: session.user.id,
          mentorId: booking.mentorId,
        },
      });

      // Update or create payment record with Razorpay Order ID
      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          razorpayOrderId: order.id,
          amount: finalAmount,
          currency: "INR",
          status: "PENDING",
        },
        create: {
          bookingId: booking.id,
          razorpayOrderId: order.id,
          amount: finalAmount,
          currency: "INR",
          status: "PENDING",
        },
      });

      return NextResponse.json(order);
    }

    if (type === "PREMIUM_UNLOCK") {
      const proPlanPrice = 99; // Standard 99 INR for monthly PRO subscription
      const amountInPaise = proPlanPrice * 100;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `sub_${session.user.id.slice(0, 12)}_${Date.now().toString().slice(-8)}`,
        notes: {
          type: "PREMIUM_UNLOCK",
          userId: session.user.id,
        },
      });

      return NextResponse.json(order);
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Error creating order", details: error.message },
      { status: 500 }
    );
  }
}
