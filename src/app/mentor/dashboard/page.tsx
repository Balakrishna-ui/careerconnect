import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Video, DollarSign, Calendar, Users, TrendingUp, Check, X } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MentorBookingActions } from "@/components/mentor/MentorBookingActions";

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      bookings: {
        include: {
          user: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  // Calculate statistics
  const confirmedBookings = mentor.bookings.filter(b => b.status === "CONFIRMED");
  const pendingBookings = mentor.bookings.filter(b => b.status === "PENDING");
  
  const totalEarnings = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalSessions = confirmedBookings.length;
  
  // Unique mentees
  const menteeIds = new Set(mentor.bookings.map(b => b.userId));
  const totalMentees = menteeIds.size;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">&#8377;{totalEarnings}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
                  <TrendingUp className="h-3 w-3 mr-1" /> All time
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmed sessions
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none bg-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMentees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique individuals
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-none bg-primary/10">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{pendingBookings.length}</div>
                <p className="text-xs text-muted-foreground mt-1 text-primary/80">
                  Needs your attention
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests at the moment.</p>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm border-border/50">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold uppercase">
                          {booking.user.name.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold">{booking.user.name}</h4>
                          <p className="text-xs text-muted-foreground">Requested a session</p>
                          <p className="text-xs font-medium text-primary mt-1">
                            {booking.date.toLocaleDateString()} at {booking.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <MentorBookingActions bookingId={booking.id} patientName={booking.user.name} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4">Upcoming Schedule</h2>
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                      No upcoming sessions
                    </TableCell>
                  </TableRow>
                ) : (
                  confirmedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.user.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{booking.date.toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{booking.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary" className="gap-2" nativeButton={false} render={<a href={booking.meetingLink || "#"} target="_blank" rel="noreferrer" />}>
                          <Video className="h-3 w-3" /> Join
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </div>
  );
}
