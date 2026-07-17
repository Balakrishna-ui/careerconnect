import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProfileCompletion } from "@/lib/mentor-utils";


import { ProfileHeader } from "@/components/mentor/profile/ProfileHeader";
import { SectionCards } from "@/components/mentor/profile/SectionCards";
import { InsightsSidebar } from "@/components/mentor/profile/InsightsSidebar";

export default async function MentorProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      experiences: true,
      skills: true,
      settings: true,
      sessionTypes: true,
      socialProfiles: true,
      documents: true,
      educations: true,
      projects: true,
      certifications: true, // TS reload
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  const { score } = calculateProfileCompletion(mentor);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 px-4">
      <ProfileHeader />
      
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Content Area (Editable Sections) */}
        <div className="flex-1 space-y-6 min-w-0">
          <SectionCards />
        </div>
        
        {/* Right Sidebar (Insights) */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <InsightsSidebar mentor={mentor} />
        </div>
        
      </div>
    </div>
  );
}
