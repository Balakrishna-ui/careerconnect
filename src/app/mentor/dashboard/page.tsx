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

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  // Pre-fetch initial data for SSR
  const initialData = await getMentorDashboardRealtime(session.user.id);

  return (
    <MentorDashboardClient 
      mentorUserId={session.user.id} 
      mentorName={session.user.name || "Mentor"} 
      initialData={initialData}
    />
  );
}
