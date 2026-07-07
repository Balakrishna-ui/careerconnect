import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function PaymentHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signup?view=login");
  }

  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        userId: session.user.id
      }
    },
    include: {
      booking: {
        include: {
          mentor: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">View and download invoices for all your mentorship sessions.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No payment history found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.razorpayPaymentId || payment.id.substring(0, 12)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/bookings/${payment.bookingId}`} className="hover:underline hover:text-primary flex items-center gap-1">
                        {payment.booking?.mentor?.name}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{(payment.amount / 100).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      Razorpay
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={payment.status === "SUCCESS" || payment.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}>
                        {payment.status === "SUCCESS" ? "Paid" : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-primary">
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </Button>
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
