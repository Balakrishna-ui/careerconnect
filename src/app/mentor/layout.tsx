import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileLayoutClient } from "./ProfileLayoutClient";
import Link from "next/link";
import { BriefcaseBusiness, Search, Moon, ChevronDown } from "lucide-react";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.id) {
    redirect("/signup?view=login&type=mentor");
  }

  if (session.user.role === "JOB_SEEKER") {
    redirect("/dashboard");
  }

  if (session.user.role !== "MENTOR" && session.user.role !== "ADMIN") {
    redirect("/signup?view=login&type=mentor");
  }

  // Fetch full mentor details for the sidebar with connection retry
  let mentor: any = null;
  try {
    mentor = await prisma.mentor.findUnique({
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
  } catch (err: any) {
    console.warn("Retrying mentor query after connection reset:", err?.message);
    try {
      await new Promise((r) => setTimeout(r, 600));
      mentor = await prisma.mentor.findUnique({
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
    } catch (retryErr) {
      console.error("Failed to fetch mentor profile on retry:", retryErr);
    }
  }

  if (!mentor) {
    try {
      // Check if user actually exists in the DB (JWT might be stale after DB reset)
      const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!userExists) {
        redirect("/api/auth/signout?callbackUrl=/signup?view=login");
      }

      // Create missing mentor profile to break the infinite redirect loop
      const newMentor = await prisma.mentor.create({
        data: {
          userId: session.user.id,
          name: session.user.name || "Mentor",
        }
      });
      
      // Attach empty relations to match the expected shape
      mentor = {
        ...newMentor,
        user: session.user as any,
        skills: [],
        experiences: [],
        educations: [],
        socialProfiles: null,
        settings: null,
        sessionTypes: [],
        documents: [],
        bookings: [],
        reviews: [],
        projects: [],
        certifications: [],
      } as any;
    } catch (error) {
      console.error("Failed to create mentor profile:", error);
      redirect("/api/auth/signout?callbackUrl=/signup?view=login");
    }
  }

  if (!mentor) return null;

  // Calculate stats
  const completedSessions = mentor.bookings?.length || 0; 
  const bookingsCount = mentor.bookings?.length || 0;
  
  const rating = mentor.reviews && mentor.reviews.length > 0 
    ? mentor.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / mentor.reviews.length 
    : 0;

  const stats = {
    searchViews: 128,
    profileViews: 45,
    responseRate: 98,
    completedSessions,
    bookings: bookingsCount,
    rating
  };

  const userInitial = session.user.name?.charAt(0).toUpperCase() || "S";

  return (
    <div className="bg-[#F8F9FA] dark:bg-background min-h-screen flex flex-col font-sans">
      {/* Custom Mentor Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-border/40 bg-white dark:bg-card px-6 h-16 flex items-center justify-between shadow-sm">
        {/* Left Logo */}
        <div className="flex items-center gap-2">
          <Link href="/mentor/dashboard" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-1.5 rounded-xl shadow-md shadow-orange-500/10 group-hover:shadow-orange-500/20 transition-all">
              <BriefcaseBusiness className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-foreground">
              CareerConnect
            </span>
          </Link>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#F3F4F6] dark:bg-muted border border-transparent focus-within:border-gray-200 dark:focus-within:border-border rounded-xl px-4 py-2 w-96 relative transition-all">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search bookings, sessions, mentees..." 
            className="bg-transparent border-none outline-none text-xs w-full text-gray-600 dark:text-foreground placeholder-gray-400" 
          />
          <span className="absolute right-4 text-[10px] text-gray-400 font-bold bg-white dark:bg-card border border-gray-200 dark:border-border px-1.5 py-0.5 rounded-md">
            ⌘ K
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Theme Toggle */}
          <button className="p-2 rounded-xl text-gray-500 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
            <Moon className="w-5 h-5" />
          </button>

          <div className="h-8 w-px bg-gray-100 dark:bg-border/60"></div>

          {/* Profile Dropdown */}
          <Link href="/mentor/profile" className="flex items-center gap-2.5 cursor-pointer pl-1.5 group">
            {mentor.image || session.user.image ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                <img src={(mentor.image || session.user.image) as string} alt={session.user.name || "Mentor"} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                {userInitial}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-foreground leading-none group-hover:text-orange-600 transition-colors">{session.user.name}</span>
              <span className="text-[10px] text-gray-400 dark:text-muted-foreground mt-1 font-medium">Mentor</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </Link>
        </div>
      </header>

      {/* Main Content Area - Wide desktop SaaS layout */}
      <div className="flex-1 w-full max-w-[1750px] mx-auto px-4 md:px-6 lg:px-8 py-5">
        <ProfileLayoutClient mentor={mentor} stats={stats}>
          {children}
        </ProfileLayoutClient>
      </div>
    </div>
  );
}
