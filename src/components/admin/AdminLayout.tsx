"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
