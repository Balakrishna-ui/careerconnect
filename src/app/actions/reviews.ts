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

  // Create review
  await prisma.review.create({
    data: {
      userId,
      mentorId,
      bookingId,
      rating,
      comment: comment.trim() !== "" ? comment.trim() : null
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/mentors/${mentorId}`);
}
