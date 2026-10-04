"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(bookingId: string, rating: number, comment?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!rating || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be an integer between 1 and 5." };
    }

    const sanitizedComment = comment ? String(comment).slice(0, 2000).trim() : null;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { mentor: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.userId !== session.user.id) {
      return { success: false, error: "Unauthorized to review this booking" };
    }

    if (booking.status !== "COMPLETED") {
      return { success: false, error: "You can only review completed sessions" };
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this session" };
    }

    // Create review and update aggregate ratings atomically in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          userId: session.user.id,
          mentorId: booking.mentorId,
          bookingId: bookingId,
          rating,
          comment: sanitizedComment,
        },
      });

      // Update Mentor's aggregate rating
      const mentorReviews = await tx.review.findMany({
        where: { mentorId: booking.mentorId },
        select: { rating: true },
      });

      const newReviewsCount = mentorReviews.length;
      const totalScore = mentorReviews.reduce((acc, r) => acc + r.rating, 0);
      const newRating = newReviewsCount > 0 ? (totalScore / newReviewsCount) : 0;

      await tx.mentor.update({
        where: { id: booking.mentorId },
        data: {
          rating: Number(newRating.toFixed(1)),
          reviewsCount: newReviewsCount,
        },
      });

      // Notify Mentor
      await tx.notification.create({
        data: {
          userId: booking.mentor.userId,
          type: "NEW_REVIEW",
          message: `You received a new ${rating}-star review!`,
          bookingId: bookingId,
        }
      });
    });

    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath(`/mentors/${booking.mentorId}`);
    revalidatePath(`/dashboard/bookings`);

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}
