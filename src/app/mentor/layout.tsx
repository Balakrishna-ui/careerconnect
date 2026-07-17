import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeftProfileSidebar } from "@/components/mentor/sidebar/LeftProfileSidebar";

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
      reviews: true
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  // Calculate some mock and real stats for performance card
  const completedSessions = mentor.bookings.length; // assuming all confirmed are completed for demo
  const bookingsCount = mentor.bookings.length;
  
  // Real rating calculation
  const rating = mentor.reviews.length > 0 
    ? mentor.reviews.reduce((acc, rev) => acc + rev.rating, 0) / mentor.reviews.length 
    : 0;

  // Mocks for performance card
  const searchViews = 128;
  const profileViews = 45;
  const responseRate = 98;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Profile Sidebar (22% on desktop) */}
          <aside className="w-full lg:w-[280px] xl:w-[320px] shrink-0">
            <LeftProfileSidebar 
              mentor={mentor}
              searchViews={searchViews}
              profileViews={profileViews}
              bookings={bookingsCount}
              completedSessions={completedSessions}
              responseRate={responseRate}
              rating={rating}
            />
          </aside>

          {/* Main Content Area (Remaining width) */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
