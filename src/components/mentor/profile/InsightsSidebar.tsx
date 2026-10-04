"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Eye, Search, MousePointerClick, Calendar, CheckCircle, Star, MessageSquare, IndianRupee, Users } from "lucide-react";

interface InsightsSidebarProps {
  mentor: any;
}

export function InsightsSidebar({ mentor }: InsightsSidebarProps) {
  const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const completedBookings = mentor?.bookings?.filter((b: any) => b.status === "COMPLETED") || [];
  const sessionsCompletedCount = Math.max(completedBookings.length, mentor?.totalSessions || 0);

  const earningsThisMonth = mentor?.bookings
    ?.filter((b: any) => (b.status === "COMPLETED" || b.status === "CONFIRMED") && new Date(b.createdAt) >= startOfCurrentMonth)
    .reduce((sum: number, b: any) => sum + (b.price || 0), 0) || 0;

  const userBookingCounts = new Map<string, number>();
  mentor?.bookings?.forEach((b: any) => {
    if (b.userId) {
      userBookingCounts.set(b.userId, (userBookingCounts.get(b.userId) || 0) + 1);
    }
  });
  const repeatClientsCount = Array.from(userBookingCounts.values()).filter(count => count > 1).length;

  const avgRating = mentor?.reviews?.length > 0
    ? (mentor.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / mentor.reviews.length).toFixed(1)
    : (mentor?.rating ? mentor.rating.toFixed(1) : "0.0");

  const metrics = [
    { icon: Eye, label: "Profile Views", value: mentor?.profileViews || 0, color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Search, label: "Search Appearances", value: mentor?.searchAppearances || 0, color: "text-purple-500", bg: "bg-purple-50" },
    { icon: MousePointerClick, label: "Profile Clicks", value: mentor?.profileClicks || 0, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Calendar, label: "Bookings", value: mentor?.bookings?.length || 0, color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: CheckCircle, label: "Sessions Completed", value: sessionsCompletedCount, color: "text-green-500", bg: "bg-green-50" },
    { icon: Star, label: "Average Rating", value: avgRating, color: "text-yellow-500", bg: "bg-yellow-50" },
    { icon: MessageSquare, label: "Response Rate", value: `${mentor?.responseRate || 100}%`, color: "text-pink-500", bg: "bg-pink-50" },
    { icon: IndianRupee, label: "Earnings This Month", value: `₹${earningsThisMonth}`, color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: Users, label: "Repeat Clients", value: repeatClientsCount, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6 sticky top-6">
      <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
          <h3 className="font-bold text-lg">Mentor Insights</h3>
          <p className="text-blue-100 text-sm">Last 30 days performance</p>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${metric.bg}`}>
                    <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                </div>
                <span className="font-bold text-foreground">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Setup Tips Card */}
      <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
        <CardContent className="p-4">
          <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-600 fill-current" />
            Pro Tip
          </h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Mentors with a fully completed profile and a high-quality video introduction receive up to <strong>4x more bookings</strong>. Keep your availability updated!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
