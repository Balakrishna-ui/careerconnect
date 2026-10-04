import { calculateCommission } from "@/lib/commission";
import { Prisma } from "@prisma/client";

export interface PaymentSuccessInput {
  bookingId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  grossAmount: number;
  userId: string;
  mentorId: string;
}

export interface RefundInput {
  paymentId: string;
  bookingId: string;
  refundAmount: number;
  reason?: string;
  razorpayRefundId: string;
  userId?: string;
  mentorId?: string;
}

/**
 * Executes payment capture state update, booking status transition,
 * and creates an immutable financial ledger entry atomically.
 */
export async function executePaymentSuccess(
  tx: Prisma.TransactionClient,
  input: PaymentSuccessInput
) {
  const {
    bookingId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    grossAmount,
    userId,
    mentorId,
  } = input;

  const split = calculateCommission(grossAmount);

  // 1. Update Payment Record
  const updatedPayment = await tx.payment.upsert({
    where: { bookingId },
    update: {
      status: "SUCCESS",
      razorpayPaymentId,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      amount: grossAmount,
      platformFee: split.platformFee,
      mentorEarnings: split.mentorEarnings,
    },
    create: {
      bookingId,
      status: "SUCCESS",
      razorpayPaymentId,
      razorpayOrderId: razorpayOrderId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      amount: grossAmount,
      platformFee: split.platformFee,
      mentorEarnings: split.mentorEarnings,
      currency: "INR",
    },
  });

  // 2. Transition Booking status from AWAITING_PAYMENT to PENDING (awaiting mentor acceptance)
  const updatedBooking = await tx.booking.update({
    where: { id: bookingId },
    data: { status: "PENDING" },
    include: { mentor: true, user: true },
  });

  // 3. Create Immutable Financial Ledger Entry
  await tx.ledgerEntry.create({
    data: {
      paymentId: updatedPayment.id,
      bookingId,
      userId,
      mentorId,
      type: "PAYMENT",
      grossAmount: split.grossAmount,
      platformFee: split.platformFee,
      mentorEarnings: split.mentorEarnings,
      currency: "INR",
      status: "COMPLETED",
      description: `Payment captured for session with ${updatedBooking.mentor.name}`,
      referenceId: razorpayPaymentId,
      metadata: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        bookingTitle: updatedBooking.sessionTitle,
      }),
    },
  });

  // 4. Create Notification for Mentor
  await tx.notification.create({
    data: {
      bookingId,
      userId,
      mentorId,
      type: "NEW_BOOKING_REQUEST",
      message: `You have a new session request from ${updatedBooking.user.name || "a mentee"}.`,
      status: "PENDING",
    },
  });

  return { payment: updatedPayment, booking: updatedBooking, split };
}

/**
 * Executes a refund state update and records a reversing financial ledger entry.
 */
export async function executeRefund(
  tx: Prisma.TransactionClient,
  input: RefundInput
) {
  const { paymentId, bookingId, refundAmount, reason, razorpayRefundId, userId, mentorId } = input;

  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  const currentRefunded = payment.refundAmount || 0;
  const remainingRefundable = payment.amount - currentRefunded;

  if (refundAmount > remainingRefundable) {
    throw new Error(
      `Refund amount (${refundAmount}) exceeds remaining refundable amount (${remainingRefundable})`
    );
  }

  const newTotalRefunded = currentRefunded + refundAmount;
  const isFullRefund = newTotalRefunded >= payment.amount;

  // 1. Update Payment Record
  const updatedPayment = await tx.payment.update({
    where: { id: paymentId },
    data: {
      refundAmount: newTotalRefunded,
      refundStatus: "PROCESSED",
      status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
    },
  });

  // 2. Create Reversing Financial Ledger Entry
  const split = calculateCommission(refundAmount);
  await tx.ledgerEntry.create({
    data: {
      paymentId,
      bookingId,
      userId: userId || null,
      mentorId: mentorId || null,
      type: "REFUND",
      grossAmount: -refundAmount,
      platformFee: -split.platformFee,
      mentorEarnings: -split.mentorEarnings,
      currency: "INR",
      status: "COMPLETED",
      description: `Refund processed: ${reason || "Booking cancelled"}`,
      referenceId: razorpayRefundId,
      metadata: JSON.stringify({
        reason,
        isFullRefund,
        originalPaymentAmount: payment.amount,
      }),
    },
  });

  return { payment: updatedPayment, isFullRefund, split };
}
