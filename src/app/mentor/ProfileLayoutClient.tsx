"use client";

import { MentorProfileProvider } from "@/contexts/MentorProfileContext";
import { LeftProfileSidebar } from "@/components/mentor/sidebar/LeftProfileSidebar";

export function ProfileLayoutClient({ children, mentor, stats }: { children: React.ReactNode, mentor: any, stats: any }) {
  return (
    <MentorProfileProvider initialMentor={mentor}>
      <div className="flex flex-col lg:flex-row gap-5 xl:gap-6 items-start w-full">
        <aside className="w-full lg:w-[230px] xl:w-[240px] shrink-0 lg:sticky lg:top-[84px] self-start z-30">
          <LeftProfileSidebar 
            initialMentor={mentor}
            searchViews={stats.searchViews}
            profileViews={stats.profileViews}
            bookings={stats.bookings}
            completedSessions={stats.completedSessions}
            responseRate={stats.responseRate}
            rating={stats.rating}
          />
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </MentorProfileProvider>
  );
}
