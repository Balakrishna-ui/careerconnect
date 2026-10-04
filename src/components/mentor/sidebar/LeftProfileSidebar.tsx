"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMentorProfile } from "@/contexts/MentorProfileContext";
import { 
  LayoutGrid, 
  User, 
  Video, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  FileText,
  Users
} from "lucide-react";

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
  responseRate = 98,
  rating = 5.0
}: LeftProfileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Overview", href: "/mentor/dashboard", icon: LayoutGrid, isOverview: true },
    { name: "Profile", href: "/mentor/profile", icon: User },
    { name: "Session Pricing", href: "/mentor/session-pricing", icon: Video },
    { name: "Availability", href: "/mentor/availability", icon: Calendar },
    { name: "Bookings", href: "/mentor/bookings", icon: Clock },
    { name: "Earnings", href: "/mentor/earnings", icon: DollarSign },
    { name: "Reviews", href: "/mentor/reviews", icon: Star },
    { name: "Messages", href: "/mentor/messages", icon: MessageSquare, badge: "3" },
    { name: "Analytics", href: "/mentor/analytics", icon: BarChart3 },
    { name: "Reports", href: "/mentor/reports", icon: FileText },
    { name: "Engagement", href: "/mentor/engagement", icon: Users },
    { name: "Settings", href: "/mentor/settings", icon: Settings },
  ];

  return (
    <div className="w-full shrink-0 font-sans">
      {/* Sidebar Navigation */}
      <div className="bg-white dark:bg-card rounded-2xl p-3 shadow-xs border border-gray-100 dark:border-border">
        <nav className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const isActive = item.isOverview
              ? pathname === "/mentor/dashboard"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all group relative",
                  isActive
                    ? "bg-[#FFF5ED] dark:bg-orange-950/30 text-[#FF6B2B] dark:text-orange-400 font-bold"
                    : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/40 hover:text-gray-900 font-medium"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#FF6B2B] dark:text-orange-400" : "text-gray-400 group-hover:text-gray-600")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute right-0 top-2 bottom-2 w-1 bg-[#FF6B2B] rounded-l-full" />
                )}
              </Link>
            );
          })}

          <div className="pt-1 mt-1 border-t border-gray-50 dark:border-border/60">
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0 text-gray-400" />
              Logout
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
