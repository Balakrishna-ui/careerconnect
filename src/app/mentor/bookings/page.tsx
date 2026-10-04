import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MentorBookingsClient } from "@/components/mentor/MentorBookingsClient";

export const dynamic = "force-dynamic";

export default async function MentorBookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
  });

  const bookings = await prisma.booking.findMany({
    where: mentor ? { mentorId: mentor.id } : { mentor: { userId: session.user.id } },
    include: {
      user: {
        include: {
          experiences: true,
          educations: true,
          skills: true,
          projects: true
        }
      },
      payment: true,
      rescheduleReq: true,
      cancellationReq: true,
    },
    orderBy: { date: "desc" },
  });

  return <MentorBookingsClient initialBookings={JSON.parse(JSON.stringify(bookings))} />;
}

