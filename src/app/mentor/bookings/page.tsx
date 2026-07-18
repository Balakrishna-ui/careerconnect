import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MentorBookingActions } from "@/components/mentor/MentorBookingActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MentorBookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const bookings = await prisma.booking.findMany({
    where: { mentorId: session.user.id },
    include: {
      user: true,
      payment: true
    },
    orderBy: { date: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <Badge className="bg-emerald-500">Confirmed</Badge>;
      case "PENDING": return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "COMPLETED": return <Badge variant="outline">Completed</Badge>;
      case "CANCELLED": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings & Sessions</h2>
        <p className="text-muted-foreground">
          Manage your upcoming and past mentoring sessions.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A complete history of your scheduled sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentee</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {booking.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.startTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <span className="font-medium">&#8377;{booking.price}</span>
                      <div className="text-xs text-muted-foreground">{booking.payment?.status || 'UNPAID'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "CONFIRMED" ? (
                        <Button size="sm" className="gap-2" nativeButton={false} render={<a href={booking.meetingLink || "#"} target="_blank" rel="noreferrer" />}>
                          <Video className="w-4 h-4" /> Join
                        </Button>
                      ) : booking.status === "PENDING" ? (
                        <MentorBookingActions bookingId={booking.id} patientName={booking.user.name} />
                      ) : (
                        <Button size="sm" variant="outline" className="gap-2">
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
