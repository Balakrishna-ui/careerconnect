"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateNotificationParams = {
  type: string;
  message: string;
  bookingId?: string;
  userId?: string;
  mentorId?: string;
  actionUrl?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    const { type, message, bookingId, userId, mentorId, actionUrl } = params;

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        bookingId,
        userId,
        mentorId,
        actionUrl,
      },
    });

    // Trigger email asynchronously if it's a critical notification type
    if (type === 'BOOKING_CREATED' || type === 'PAYMENT_SUCCESS' || type === 'BOOKING_ACCEPTED' || type === 'BOOKING_RESCHEDULED') {
      // We need to fetch the recipient's email
      const recipient = await prisma.user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(mentorId ? [{ mentorProfile: { id: mentorId } }] : [])
          ]
        },
        select: { email: true, name: true }
      });

      if (recipient?.email) {
        // Import dynamically to avoid circular dependencies in server actions
        const { sendNotificationEmail } = await import("@/lib/email");
        // Fire and forget
        sendNotificationEmail(
          recipient.email,
          recipient.name || "User",
          type,
          message,
          actionUrl
        ).catch(console.error);
      }
    }

    // Revalidate paths so UI updates if using Server Components
    if (userId) revalidatePath("/dashboard");
    if (mentorId) revalidatePath("/mentor/dashboard");

    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}
