import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MentorDashboardClient } from "@/components/mentor/dashboard/MentorDashboardClient";
import { getMentorDashboardRealtime } from "@/actions/realtime-actions";
import { prisma } from "@/lib/prisma";

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  let mentor: any = null;
  try {
    mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
      include: {
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching mentor profile in SSR:", err);
  }

  if (!mentor) {
    try {
      // Check if user actually exists in the DB (JWT might be stale after DB reset)
      const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!userExists) {
        redirect("/api/auth/signout?callbackUrl=/signup?view=login");
      }

      // Create missing mentor profile to break the infinite redirect loop
      mentor = await prisma.mentor.create({
        data: {
          userId: session.user.id,
          name: session.user.name || "Mentor",
        }
      });
    } catch (error) {
      console.error("Failed to create mentor profile:", error);
      redirect("/api/auth/signout?callbackUrl=/signup?view=login");
    }
  }

  // Pre-fetch initial data for SSR
  let initialData = null;
  try {
    initialData = await getMentorDashboardRealtime(session.user.id);
  } catch (err) {
    console.error("Error pre-fetching realtime mentor dashboard:", err);
  }

  return (
    <MentorDashboardClient 
      mentorUserId={session.user.id} 
      mentorId={mentor.id}
      mentorName={session.user.name || "Mentor"} 
      initialData={initialData}
      reviews={mentor?.reviews || []}
    />
  );
}
