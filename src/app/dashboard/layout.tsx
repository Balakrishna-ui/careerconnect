import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobSeekerSidebar } from "@/components/dashboard/JobSeekerSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Bell } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.id) {
    redirect("/signup?view=login");
  }

  if (session.user.role === "MENTOR") {
    redirect("/mentor/dashboard");
  }

  if (session.user.role !== "JOB_SEEKER" && session.user.role !== "ADMIN") {
    redirect("/signup?view=login");
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden dark:bg-slate-950">
      <JobSeekerSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-end px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 gap-4 shrink-0">
          <ThemeToggle />
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Bell className="h-5 w-5" />
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
