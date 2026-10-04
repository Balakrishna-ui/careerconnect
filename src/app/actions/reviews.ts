"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(bookingId: string, mentorId: string, rating: number, comment: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Verify booking belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found or unauthorized");
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId }
  });

  if (existingReview) {
    throw new Error("Review already submitted for this booking");
  }

  // Create review and update aggregate ratings atomically in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        userId,
        mentorId,
        bookingId,
        rating,
        comment: comment.trim() !== "" ? comment.trim() : null
      }
    });

    const mentorReviews = await tx.review.findMany({
      where: { mentorId },
      select: { rating: true },
    });

    const newReviewsCount = mentorReviews.length;
    const totalScore = mentorReviews.reduce((acc, r) => acc + r.rating, 0);
    const newRating = newReviewsCount > 0 ? totalScore / newReviewsCount : 0;

    await tx.mentor.update({
      where: { id: mentorId },
      data: {
        rating: Number(newRating.toFixed(1)),
        reviewsCount: newReviewsCount,
      },
    });

    if (booking.mentorId) {
      const mentorObj = await tx.mentor.findUnique({
        where: { id: mentorId },
        select: { userId: true },
      });
      if (mentorObj) {
        await tx.notification.create({
          data: {
            userId: mentorObj.userId,
            type: "NEW_REVIEW",
            message: `You received a new ${rating}-star review!`,
            bookingId: bookingId,
          }
        });
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/mentors/${mentorId}`);
}
