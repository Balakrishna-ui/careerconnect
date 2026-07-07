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
      {/* @ts-ignore */}
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full gap-2 px-3 hover:bg-muted/50 transition-colors">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate font-semibold">{firstName}</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 border-l-0 sm:border-l shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
              <AvatarImage src={data?.user?.image || avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{data?.user?.name || session?.user?.name}</h2>
            <p className="text-sm font-medium text-muted-foreground">{data?.user?.email || session?.user?.email}</p>
          </div>

          {!loading && data?.stats?.completion !== undefined && (
            <div className="mt-6 bg-background rounded-xl p-4 shadow-sm border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Profile Completion</span>
                <span className="text-xs font-bold text-primary">{Math.min(data.stats.completion, 100)}%</span>
              </div>
              <Progress value={Math.min(data.stats.completion, 100)} className="h-1.5" />
            </div>
          )}
        </div>

        <div className="px-4 pb-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-xl p-3 text-center border border-border/40 hover:bg-muted/60 transition-colors">
              <div className="flex justify-center mb-1"><Heart className="w-4 h-4 text-rose-500" /></div>
              <div className="text-lg font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.savedMentorsCount || 0)}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Saved</div>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center border border-border/40 hover:bg-muted/60 transition-colors">
              <div className="flex justify-center mb-1"><Video className="w-4 h-4 text-blue-600" /></div>
              <div className="text-lg font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.upcomingSessionsCount || 0)}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Upcoming</div>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center border border-border/40 hover:bg-muted/60 transition-colors">
              <div className="flex justify-center mb-1"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
              <div className="text-lg font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (data?.stats?.completedSessionsCount || 0)}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Completed</div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Quick Actions */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</h3>
            <button onClick={() => handleNavigation("/dashboard")} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 text-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><LayoutDashboard className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => handleNavigation("/profile")} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 text-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><User className="w-4 h-4" /></div>
                <span className="text-sm font-medium">My Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => handleNavigation("/dashboard")} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 text-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><CalendarDays className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Bookings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => handleNavigation("/messages")} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 text-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><MessageSquare className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Messages</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button onClick={() => handleNavigation("/settings")} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 text-foreground transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><Settings className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          <Separator className="bg-border/60" />

          {/* Recent Activity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">Recent Bookings</h3>
            {loading ? (
              <div className="space-y-3 px-2">
                <div className="h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                <div className="h-10 bg-muted/50 rounded-lg animate-pulse"></div>
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-1">
                {data.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                      <CalendarDays className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{activity.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString()} • {activity.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-2 py-4 text-center border border-dashed rounded-lg bg-muted/20">
                <Activity className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-xs text-muted-foreground">No recent bookings.</p>
              </div>
            )}
          </div>

          <Separator className="bg-border/60" />

          {/* Logout */}
          <div className="pt-2 pb-8">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out securely
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
