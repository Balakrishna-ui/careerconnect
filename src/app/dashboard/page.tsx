import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobSeekerDashboardClient } from "@/components/dashboard/JobSeekerDashboardClient";
import { getJobSeekerDashboardRealtime } from "@/actions/realtime-actions";
import { prisma } from "@/lib/prisma";

export default async function JobSeekerDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || user?.role === "MENTOR") {
    redirect(user?.role === "MENTOR" ? "/mentor/dashboard" : "/signup?view=login");
  }

  const firstName = user?.name?.split(" ")[0] || "User";

  // Pre-fetch initial data for SSR
  const initialData = await getJobSeekerDashboardRealtime(user.id);
  
  // Reviews
  const completedBookings = (initialData?.completedSessions && initialData.completedSessions > 0)
    ? initialData.allBookings.filter((b: any) => b.status === "COMPLETED" || new Date(b.endTime) < new Date())
    : [];
    
  let userReviews: any[] = [];
  try {
    userReviews = await prisma.review.findMany({
      where: { userId: user.id },
    });
  } catch (error) {
    console.warn("Database query failed for reviews. Falling back to empty array.");
  }
  
  const reviewedBookingIds = new Set(userReviews.map((r) => r.bookingId));
  const needsReviewBookings = completedBookings.filter((b: any) => !reviewedBookingIds.has(b.id));

  return (
    <JobSeekerDashboardClient 
      userId={user.id} 
      firstName={firstName} 
      initialData={initialData}
      needsReviewBookings={needsReviewBookings}
      isPremium={user.premium || false}
    />
  );
}
