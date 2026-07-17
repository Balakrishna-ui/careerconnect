import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Calendar, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Analytics & Insights | CareerConnect",
  description: "View your detailed mentor performance and earnings insights.",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch some real stats or calculate them
  // For now, we will query total earnings and counts.
  const mentorId = session.user.id;
  
  const allBookings = await prisma.booking.findMany({
    where: { mentorId },
    select: { status: true, price: true, createdAt: true }
  });

  const totalEarnings = allBookings
    .filter(b => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.price || 0), 0);
    
  const totalBookings = allBookings.length;
  const completedBookings = allBookings.filter(b => b.status === "COMPLETED").length;
  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/mentor/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Detailed Insights</h1>
          <p className="text-muted-foreground mt-1 text-sm">Analyze your performance, earnings, and engagement.</p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">₹{totalEarnings}</h3>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 flex items-center mt-4 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{totalBookings}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600 flex items-center mt-4 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> Active engagement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{completionRate}%</h3>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">
              Of all accepted requests
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">128</h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-purple-600 flex items-center mt-4 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +42 this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <Card className="shadow-sm border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Earnings Overview (Past 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-border/50 relative">
              {/* Decorative grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-full h-[1px] bg-border/40" />
                ))}
              </div>
              
              {/* Mock Bar Chart */}
              {[40, 70, 45, 90, 65, 100].map((height, i) => (
                <div key={i} className="w-1/6 flex flex-col items-center justify-end z-10 group cursor-pointer h-full">
                  <div 
                    className="w-4/5 bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-300 ease-in-out group-hover:opacity-100"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2 font-medium">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                You are getting most of your requests during the <strong>weekend</strong>. Consider opening up more availability on Saturdays to increase your booking rate by an estimated <strong>25%</strong>.
              </p>
              <Link href="/mentor/availability" className="block w-full mt-6">
                <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-primary/20">
                  Update Availability
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Career Guidance</span>
                    <span className="text-muted-foreground">65%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Resume Review</span>
                    <span className="text-muted-foreground">25%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[25%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Mock Interview</span>
                    <span className="text-muted-foreground">10%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[10%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
