import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MentorEarningsPage() {
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
        where: {
          status: {
            in: ["CONFIRMED", "COMPLETED"]
          }
        },
        orderBy: { date: "desc" },
      }
    }
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  const completedBookings = mentor.bookings;

  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);
  
  // Available for Payout (e.g. sessions completed in the past)
  const now = new Date();
  const pastBookings = completedBookings.filter(b => new Date(b.endTime) < now);
  const availablePayout = pastBookings.reduce((sum, b) => sum + b.price, 0);

  // Pending Clearing (e.g. upcoming confirmed sessions)
  const upcomingBookings = completedBookings.filter(b => new Date(b.endTime) >= now);
  const pendingClearing = upcomingBookings.reduce((sum, b) => sum + b.price, 0);

  const PLATFORM_FEE_PERCENT = 0.10; // 10% fee

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Earnings & Payouts</h2>
          <p className="text-muted-foreground">Track your revenue and download invoices.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">&#8377;{(availablePayout * (1 - PLATFORM_FEE_PERCENT)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <Button className="w-full mt-4" disabled={availablePayout === 0}>Withdraw Funds</Button>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Clearing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">&#8377;{(pendingClearing * (1 - PLATFORM_FEE_PERCENT)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Funds clear after session
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Gross Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">&#8377;{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-primary/80 mt-2">Before {PLATFORM_FEE_PERCENT * 100}% platform fee</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent payouts and session earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead className="text-right">Net Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  completedBookings.map((booking) => {
                    const fee = booking.price * PLATFORM_FEE_PERCENT;
                    const net = booking.price - fee;
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                          {booking.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>{booking.user.name}</TableCell>
                        <TableCell>
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>&#8377;{booking.price}</TableCell>
                        <TableCell className="text-red-500">-&#8377;{fee.toFixed(0)}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          &#8377;{net.toFixed(0)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
