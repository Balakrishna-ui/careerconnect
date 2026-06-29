"use client";

import { Bell, Search, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search anything..."
            className="pl-9 pr-4 h-9 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">Super Admin</p>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Full Access</p>
          </div>
        </div>
      </div>
    </header>
  );
}
