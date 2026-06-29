"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShieldCheck, CalendarDays, DollarSign,
  CreditCard, Star, AlertTriangle, Bell, Zap, Building2,
  LifeBuoy, BarChart3, Settings, ChevronLeft, ChevronRight,
  GraduationCap, UserCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "User Management",
    icon: Users,
    badge: null,
    children: [
      { label: "Mentors", href: "/admin/users/mentors", icon: GraduationCap },
      { label: "Job Seekers", href: "/admin/users/job-seekers", icon: UserCheck },
    ],
  },
  { label: "Verification", href: "/admin/verification", icon: ShieldCheck, badge: "47" },
  { label: "Sessions", href: "/admin/sessions", icon: CalendarDays, badge: null },
  { label: "Availability", href: "/admin/availability", icon: CalendarDays, badge: null },
  { label: "Revenue", href: "/admin/revenue", icon: DollarSign, badge: null },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, badge: null },
  { label: "Reviews", href: "/admin/reviews", icon: Star, badge: null },
  { label: "Fraud Detection", href: "/admin/fraud", icon: AlertTriangle, badge: "4" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, badge: null },
  { label: "Featured Mentors", href: "/admin/featured", icon: Zap, badge: null },
  { label: "Companies", href: "/admin/companies", icon: Building2, badge: null },
  { label: "Support", href: "/admin/support", icon: LifeBuoy, badge: "3" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, badge: null },
  { label: "Settings", href: "/admin/settings", icon: Settings, badge: null },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["User Management"]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => href && pathname === href;
  const isGroupActive = (children?: { href: string }[]) =>
    children?.some((c) => pathname.startsWith(c.href));

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-gray-950 text-gray-300 border-r border-gray-800 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-gray-800", collapsed && "justify-center px-2")}>
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg flex-shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm">CareerConnect</p>
            <p className="text-gray-500 text-xs">Super Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.label);
            const groupActive = isGroupActive(item.children);
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 hover:text-white",
                    groupActive && "text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", groupActive ? "text-blue-400" : "")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-800 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-gray-800 hover:text-white",
                          isActive(child.href) ? "bg-blue-600/20 text-blue-400 font-medium" : "text-gray-400"
                        )}
                      >
                        <child.icon className="w-3.5 h-3.5" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 hover:text-white",
                isActive(item.href) ? "bg-blue-600/20 text-blue-400 font-medium border border-blue-600/30" : "text-gray-400",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive(item.href) ? "text-blue-400" : "")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Bottom Admin Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">Super Admin</p>
              <p className="text-gray-500 text-xs truncate">admin@careerconnect.io</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
