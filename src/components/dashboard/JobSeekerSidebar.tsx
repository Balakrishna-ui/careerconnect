"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BriefcaseBusiness, 
  LayoutDashboard, 
  Target, 
  Users, 
  FolderKanban, 
  CreditCard, 
  Globe, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Users2, 
  Receipt,
  Bell
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function JobSeekerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const isActive = (path: string) => pathname === path;

  const navigation = [
    {
      title: "GUIDANCE",
      items: [
        { name: "Find a Mentor", href: "/mentors", icon: Target },
        { name: "Saved Mentors", href: "/dashboard/saved-mentors", icon: Users },
        { name: "My Bookings", href: "/dashboard/bookings", icon: FolderKanban },
      ],
    },
    {
      title: "PERFORMANCE",
      items: [
        { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
        { name: "Payments", href: "/dashboard/payments", icon: Receipt },
        { name: "Public Profile", href: "/dashboard/profile", icon: Globe },
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
        { name: "Meetings", href: "/dashboard/meetings", icon: Calendar },
        { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
        { name: "Documents", href: "/dashboard/documents", icon: FileText },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Billing", href: "/dashboard/billing", icon: Receipt },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 flex flex-col hidden md:flex">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-transparent overflow-hidden">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-[#FF6B00] p-1.5 rounded-lg shrink-0">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white truncate">CareerConnect</span>
        </Link>
      </div>

      {/* Primary Dashboard Link */}
      <div className="px-3 mt-4 mb-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive("/dashboard") 
              ? "bg-[#FFF2EB] dark:bg-[#FF6B00]/10 text-[#FF6B00]" 
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {navigation.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href) && item.href !== "/dashboard"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition-colors">
          <Avatar className="h-9 w-9 rounded-md">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="rounded-md bg-slate-900 dark:bg-slate-700 text-white">
              {user?.name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.name}&apos;s Profile
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.premium ? "Pro Plan" : "Free Plan"}
            </p>
          </div>
          <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
