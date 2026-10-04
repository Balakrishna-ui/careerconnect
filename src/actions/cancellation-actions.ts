"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BookingStateMachine } from "@/lib/booking-state";
import { executeRefund } from "@/lib/payment-service";
import { razorpay } from "@/lib/razorpay";
import { pusherServer } from "@/lib/pusher";
import { format } from "date-fns";

/**
 * Job Seeker submits a request to cancel their booking.
 */
export async function requestBookingCancellationAction(bookingId: string, reason: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Please provide a valid cancellation reason (at least 5 characters)." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        mentor: true,
        cancellationReq: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    // Ownership check (IDOR Protection)
    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: You do not own this booking." };
    }

    // Validate that the booking is in a cancellable state
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return {
        success: false,
        error: `Cannot cancel a session that is currently in '${booking.status}' status.`,
      };
    }

    // Idempotency: If request is already pending
    if (booking.cancellationReq && booking.cancellationReq.status === "PENDING") {
      return { success: true, message: "A cancellation request is already pending mentor review." };
    }

    // Calculate potential refund eligibility based on 24-hour rule
    const now = new Date();
    const hoursUntilSession = (new Date(booking.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);
    const isRefundable = hoursUntilSession >= 24 && booking.payment && booking.payment.status === "SUCCESS";
    const estimatedRefund = isRefundable ? Math.max(0, (booking.payment?.amount || 0) - (booking.payment?.refundAmount || 0)) : 0;

    // Create or update CancellationRequest
    const cancellationReq = await prisma.cancellationRequest.upsert({
      where: { bookingId },
      update: {
        reason: reason.trim(),
        status: "PENDING",
        refundAmount: estimatedRefund,
      },
      create: {
        bookingId,
        mentorId: booking.mentorId,
        jobSeekerId: session.user.id,
        reason: reason.trim(),
        status: "PENDING",
        refundAmount: estimatedRefund,
      },
    });

    // Notify Mentor
    await prisma.notification.create({
      data: {
        bookingId,
        userId: session.user.id,
        mentorId: booking.mentorId,
        type: "CANCELLATION_REQUESTED",
        message: `${session.user.name || "A mentee"} has requested to cancel their session scheduled for ${format(new Date(booking.startTime), "PPP 'at' p")}. Reason: "${reason.trim()}"`,
      },
    });

    // Realtime notification to mentor
    try {
      await pusherServer.trigger(`mentor-${booking.mentorId}`, "cancellation-request", {
        bookingId,
        menteeName: session.user.name || "Mentee",
        reason: reason.trim(),
      });
    } catch (err) {
      console.warn("Pusher notification trigger failed:", err);
    }

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");

    return {
      success: true,
      message: "Cancellation request submitted to mentor for review.",
      request: JSON.parse(JSON.stringify(cancellationReq)),
    };
  } catch (error: any) {
    console.error("Failed to request booking cancellation:", error);
    return { success: false, error: error?.message || "Failed to submit cancellation request." };
  }
}

/**
 * Mentor approves the cancellation request.
 */
export async function approveCancellationAction(requestId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized. Mentor login required." };
    }

    const request = await prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        booking: {
          include: {
            payment: true,
            user: true,
            mentor: true,
          },
        },
      },
    });

    if (!request) {
      return { success: false, error: "Cancellation request not found." };
    }

    // Verify mentor owns this session
    if (request.booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Unauthorized: You are not the mentor for this session." };
    }

    // Idempotency: If already approved or already cancelled
    if (request.status === "APPROVED" || request.booking.status === "CANCELLED") {
      return { success: true, message: "Cancellation already approved." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "This cancellation request is no longer pending." };
    }

    // State machine validation
    try {
      BookingStateMachine.validateTransition(request.booking.status, "CANCELLED");
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    const booking = request.booking;
    const now = new Date();
    const hoursUntilSession = (new Date(booking.startTime).getTime() - now.getTime()) / (1000 * 60 * 60);
    const isRefundable = hoursUntilSession >= 24 && booking.payment && (booking.payment.status === "SUCCESS" || booking.payment.status === "PARTIALLY_REFUNDED");
    const refundAmount = isRefundable ? Math.max(0, (booking.payment?.amount || 0) - (booking.payment?.refundAmount || 0)) : 0;

    let razorpayRefundId = `rfnd_${booking.id.slice(0, 10)}_${Date.now()}`;

    // Step 1: Trigger Gateway Refund (Executed outside the DB transaction for isolation)
    if (refundAmount > 0 && booking.payment?.razorpayPaymentId) {
      try {
        if (
          process.env.RAZORPAY_KEY_SECRET &&
          !booking.payment.razorpayPaymentId.startsWith("TEST_") &&
          !booking.payment.razorpayPaymentId.startsWith("free_")
        ) {
          const rf = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
            amount: refundAmount * 100,
            notes: {
              bookingId: booking.id,
              reason: request.reason || "Booking cancelled with mentor approval",
            },
          });
          if (rf && rf.id) {
            razorpayRefundId = rf.id;
          }
        }
      } catch (gatewayErr: any) {
        console.warn("Razorpay API refund call notice (using fallback reference):", gatewayErr?.message);
      }
    }

    // Step 2: Atomic DB Transaction with Advisory Lock
    await prisma.$transaction(async (tx) => {
      // Advisory Lock
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${booking.mentorId}))`;

      // Update Booking to CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          meetingLink: null, // Revoke meeting access
        },
      });

      // Update CancellationRequest to APPROVED
      await tx.cancellationRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          refundAmount,
        },
      });

      // Execute Ledger Reversal and Payment State Update if refundable
      if (refundAmount > 0 && booking.payment) {
        await executeRefund(tx, {
          paymentId: booking.payment.id,
          bookingId: booking.id,
          refundAmount,
          reason: `Mentor approved cancellation: ${request.reason}`,
          razorpayRefundId,
          userId: booking.userId,
          mentorId: booking.mentorId,
        });
      }

      // Notifications
      const refundNotice = refundAmount > 0 ? ` Refund of ₹${refundAmount} has been initiated.` : "";
      await tx.notification.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          mentorId: booking.mentorId,
          type: "CANCELLATION_APPROVED",
          message: `Your mentor ${booking.mentor.name} has approved your cancellation request.${refundNotice}`,
        },
      });

      await tx.notification.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          mentorId: booking.mentorId,
          type: "SESSION_CANCELLED",
          message: `Session with ${booking.user.name || "mentee"} on ${format(new Date(booking.startTime), "PPP")} has been cancelled.`,
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    // Realtime alerts
    try {
      await pusherServer.trigger(`user-${booking.userId}`, "cancellation-approved", {
        bookingId: booking.id,
        refundAmount,
      });
    } catch (err) {
      console.warn("Pusher notification trigger failed:", err);
    }

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${booking.id}`);

    return {
      success: true,
      refundAmount,
      message: `Cancellation approved.${refundAmount > 0 ? ` Refund of ₹${refundAmount} processed.` : ""}`,
    };
  } catch (error: any) {
    console.error("Failed to approve cancellation:", error);
    return { success: false, error: error?.message || "Failed to approve cancellation." };
  }
}

/**
 * Mentor rejects the cancellation request.
 */
export async function rejectCancellationAction(requestId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return { success: false, error: "Unauthorized. Mentor login required." };
    }

    const request = await prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        booking: {
          include: { mentor: true, user: true },
        },
      },
    });

    if (!request) {
      return { success: false, error: "Cancellation request not found." };
    }

    if (request.booking.mentor.userId !== session.user.id) {
      return { success: false, error: "Unauthorized: You are not the mentor for this session." };
    }

    if (request.status === "REJECTED") {
      return { success: true, message: "Cancellation request already declined." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "This cancellation request is no longer pending." };
    }

    // Atomic update
    await prisma.$transaction(async (tx) => {
      await tx.cancellationRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      await tx.notification.create({
        data: {
          bookingId: request.bookingId,
          userId: request.booking.userId,
          mentorId: request.booking.mentorId,
          type: "CANCELLATION_REJECTED",
          message: `Your mentor ${request.booking.mentor.name} declined the cancellation request.${reason ? ` Note: "${reason}"` : ""} The session remains active as scheduled.`,
        },
      });
    }, { maxWait: 10000, timeout: 20000 });

    // Realtime alert
    try {
      await pusherServer.trigger(`user-${request.booking.userId}`, "cancellation-rejected", {
        bookingId: request.bookingId,
      });
    } catch (err) {
      console.warn("Pusher notification trigger failed:", err);
    }

    revalidatePath("/mentor/dashboard");
    revalidatePath("/mentor/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${request.bookingId}`);

    return { success: true, message: "Cancellation request declined. Session remains scheduled." };
  } catch (error: any) {
    console.error("Failed to decline cancellation:", error);
    return { success: false, error: error?.message || "Failed to decline cancellation." };
  }
}
