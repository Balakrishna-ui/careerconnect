"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Video, 
  Clock, 
  CalendarDays, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Settings 
} from "lucide-react";

export function MentorNav() {
  const pathname = usePathname();

  const items = [
    { name: "Overview", href: "/mentor/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/mentor/profile", icon: User },
    { name: "Session Pricing", href: "/mentor/session-pricing", icon: Video },
    { name: "Availability", href: "/mentor/availability", icon: Clock },
    { name: "Bookings", href: "/mentor/bookings", icon: CalendarDays },
    { name: "Earnings", href: "/mentor/earnings", icon: DollarSign },
    { name: "Reviews", href: "/mentor/reviews", icon: Star },
    { name: "Messages", href: "/mentor/messages", icon: MessageSquare },
    { name: "Settings", href: "/mentor/settings", icon: Settings },
  ];

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}
