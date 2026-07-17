import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeftProfileSidebar } from "@/components/mentor/sidebar/LeftProfileSidebar";

import { ProfileLayoutClient } from "./ProfileLayoutClient";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  // Fetch full mentor details for the sidebar
  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      skills: true,
      experiences: true,
      educations: true,
      socialProfiles: true,
      settings: true,
      sessionTypes: true,
      documents: true,
      bookings: {
        where: { status: "CONFIRMED" }
      },
      reviews: true,
      projects: true,
      certifications: true,
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  // Calculate some mock and real stats for performance card
  const completedSessions = mentor.bookings.length; 
  const bookingsCount = mentor.bookings.length;
  
  // Real rating calculation
  const rating = mentor.reviews.length > 0 
    ? mentor.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / mentor.reviews.length 
    : 0;

  // Mocks for performance card
  const stats = {
    searchViews: 128,
    profileViews: 45,
    responseRate: 98,
    completedSessions,
    bookings: bookingsCount,
    rating
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <ProfileLayoutClient mentor={mentor} stats={stats}>
          {children}
        </ProfileLayoutClient>
      </div>
    </div>
  );
}
