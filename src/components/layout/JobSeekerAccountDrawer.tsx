"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, Loader2, LayoutDashboard, CalendarDays, 
  MessageSquare, Settings, LogOut, Activity, ChevronRight, Video,
  Heart, CheckCircle2
} from "lucide-react";

export function JobSeekerAccountDrawer({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/user/me")
        .then(res => res.json())
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [open]);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const firstName = session?.user?.name?.split(' ')[0] || "User";
  const avatarUrl = session?.user?.image;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="outline" size="sm" className="rounded-full gap-2 px-3 hover:bg-muted/50 transition-colors" />
      }>
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[100px] truncate font-semibold">{firstName}</span>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 border-l-0 sm:border-l shadow-2xl bg-white dark:bg-slate-950">
        <div className="px-6 pt-12 pb-6 space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <Avatar className="h-16 w-16 border border-slate-100">
              <AvatarImage src={data?.user?.image || avatarUrl} />
              <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{data?.user?.name || session?.user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{data?.user?.email || session?.user?.email}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-2"><Heart className="w-5 h-5 text-rose-500" /></div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.savedMentorsCount || 0)}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Saved</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-2"><Video className="w-5 h-5 text-blue-600" /></div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.upcomingSessionsCount || 0)}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Upcoming</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-2"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.completedSessionsCount || 0)}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Completed</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 mt-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Navigation</h3>
            
            <button onClick={() => handleNavigation("/dashboard")} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400"><LayoutDashboard className="w-5 h-5" /></div>
                <span className="text-sm font-semibold">Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </button>
            
            <button onClick={() => handleNavigation("/profile")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 dark:text-blue-500"><User className="w-5 h-5" /></div>
                <span className="text-sm font-medium">My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
            </button>
            
            <button onClick={() => handleNavigation("/dashboard/bookings")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 dark:text-blue-500"><CalendarDays className="w-5 h-5" /></div>
                <span className="text-sm font-medium">Bookings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
            </button>
            
            <button onClick={() => handleNavigation("/dashboard/messages")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 dark:text-blue-500"><MessageSquare className="w-5 h-5" /></div>
                <span className="text-sm font-medium">Messages</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
            </button>
            
            <button onClick={() => handleNavigation("/dashboard/settings")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 dark:text-blue-500"><Settings className="w-5 h-5" /></div>
                <span className="text-sm font-medium">Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
            </button>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3 mt-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Recent Bookings</h3>
            {loading ? (
              <div className="space-y-3 px-1">
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {data.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-sm bg-white dark:bg-slate-900 transition-all">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.date).toLocaleDateString()} • {activity.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No recent bookings.</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="pt-6 pb-8">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 p-6 rounded-xl font-medium"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
