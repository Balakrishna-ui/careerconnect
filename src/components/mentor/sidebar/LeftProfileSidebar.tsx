import { MentorNav } from "@/app/mentor/MentorNav";
import { ProfileHealthCard } from "./ProfileHealthCard";
import { ProfilePerformanceCard } from "./ProfilePerformanceCard";
import { calculateProfileCompletion } from "@/lib/mentor-utils";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { useMentorProfile } from "@/contexts/MentorProfileContext";

interface LeftProfileSidebarProps {
  initialMentor?: any;
  searchViews: number;
  profileViews: number;
  bookings: number;
  completedSessions: number;
  responseRate: number;
  rating: number;
}

export function LeftProfileSidebar({
  initialMentor,
  searchViews,
  profileViews,
  bookings,
  completedSessions,
  responseRate,
  rating
}: LeftProfileSidebarProps) {
  const { mentorData, completionScore, missingDetails } = useMentorProfile();
  
  const mentor = mentorData || initialMentor;
  
  // Calculate total experience in years (naive approach for demo)
  let expYears = 0;
  if (mentor?.experiences && mentor.experiences.length > 0) {
    expYears = mentor.experiences.length * 2; 
  }

  const missingFields = missingDetails.map(field => ({
    label: field,
    href: "#"
  }));

  return (
    <div className="space-y-6 sticky top-6">
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-foreground mb-3 px-3 text-sm">Navigation</h3>
        <nav className="flex flex-col gap-1">
          <MentorNav />
          <Link href="/api/auth/signout" className="w-full mt-2">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </Link>
        </nav>
      </div>

      <ProfileHealthCard 
        mentorName={mentor?.user?.name || mentor?.name || "Mentor"}
        image={mentor?.image || mentor?.user?.image}
        headline={mentor?.headline}
        company={mentor?.company}
        location={mentor?.location || mentor?.city || "Remote"}
        experience={expYears > 0 ? expYears : null}
        isVerified={mentor?.documents?.some((d: any) => d.status === "VERIFIED")}
        completionScore={completionScore}
        missingFields={missingFields}
        lastUpdated="Today"
      />
      
      <ProfilePerformanceCard 
        searchViews={searchViews}
        profileViews={profileViews}
        bookings={bookings}
        completedSessions={completedSessions}
        responseRate={responseRate}
        rating={rating}
      />
    </div>
  );
}
