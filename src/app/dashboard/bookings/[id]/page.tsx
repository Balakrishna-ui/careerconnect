import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Video, FileText, IndianRupee, MessageSquare, AlertCircle, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CareerRoadmap } from "@/components/dashboard/CareerRoadmap";

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signup?view=login");
  }
  
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: {
      id: id,
      userId: session.user.id
    },
    include: {
      mentor: {
        include: {
          user: true
        }
      },
      payment: true,
      sessionNotes: true,
      sessionSummary: true,
      tasks: true,
      rescheduleReq: true
    }
  });

  if (!booking) {
    notFound();
  }

  const isCompleted = booking.status === "COMPLETED" || new Date(booking.endTime) < new Date();
  const isLive = new Date() >= new Date(booking.startTime) && new Date() <= new Date(booking.endTime);
  const isUpcoming = new Date(booking.startTime) > new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Details</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            ID: <span className="font-mono">BK-{booking.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && <Badge variant="destructive" className="animate-pulse">Live Now</Badge>}
          {isUpcoming && <Badge variant="default">Upcoming</Badge>}
          {isCompleted && <Badge variant="secondary">Completed</Badge>}
          {booking.status === "CANCELLED" && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      </div>

      {booking.rescheduleReq && (
        <Card className={cn("mb-8 shadow-sm border", 
          booking.rescheduleReq.status === "PENDING" ? "border-amber-200 bg-amber-50/50" : 
          booking.rescheduleReq.status === "REJECTED" ? "border-red-200 bg-red-50/50" : 
          "border-blue-200 bg-blue-50/50"
        )}>
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className={cn("h-5 w-5 mt-0.5",
              booking.rescheduleReq.status === "PENDING" ? "text-amber-600" :
              booking.rescheduleReq.status === "REJECTED" ? "text-red-600" :
              "text-blue-600"
            )} />
            <div>
              <h3 className={cn("font-semibold",
                booking.rescheduleReq.status === "PENDING" ? "text-amber-900" :
                booking.rescheduleReq.status === "REJECTED" ? "text-red-900" :
                "text-blue-900"
              )}>
                Reschedule Request {booking.rescheduleReq.status === "PENDING" ? "Pending Approval" : booking.rescheduleReq.status === "ACCEPTED" ? "Approved" : "Rejected"}
              </h3>
              <p className={cn("text-sm mt-1",
                booking.rescheduleReq.status === "PENDING" ? "text-amber-700/90" :
                booking.rescheduleReq.status === "REJECTED" ? "text-red-700/90" :
                "text-blue-700/90"
              )}>
                {booking.rescheduleReq.status === "PENDING" 
                  ? `You requested to reschedule this session to ${format(new Date(booking.rescheduleReq.requestedDate), 'MMM d, yyyy')} at ${new Date(booking.rescheduleReq.requestedTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true })}. Waiting for mentor approval.` 
                  : booking.rescheduleReq.status === "ACCEPTED" 
                  ? "Your reschedule request was approved. The new time is reflected below." 
                  : "Your reschedule request was rejected by the mentor. The original time remains."}
              </p>
              {booking.rescheduleReq.reason && (
                <p className={cn("text-sm mt-2 italic",
                  booking.rescheduleReq.status === "PENDING" ? "text-amber-700/70" :
                  booking.rescheduleReq.status === "REJECTED" ? "text-red-700/70" :
                  "text-blue-700/70"
                )}>
                  Reason: "{booking.rescheduleReq.reason}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isCompleted && booking.sessionNotes && (
        <div className="mb-8">
          <CareerRoadmap 
            bookingId={booking.id}
            sessionNotes={booking.sessionNotes}
            sessionSummary={booking.sessionSummary}
            tasks={booking.tasks}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0 relative border shadow-sm">
                  {booking.mentor?.image ? (
                    <Image src={booking.mentor.image} alt={booking.mentor.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground text-xl bg-secondary/30">
                      {booking.mentor?.name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-xl">{booking.mentor?.name}</h3>
                    <p className="text-muted-foreground">{booking.mentor?.role} {booking.mentor?.company ? `at ${booking.mentor.company}` : ''}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{new Date(booking.startTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(booking.endTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.status === "CANCELLED" ? (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">This session was cancelled. The meeting link is no longer available.</p>
                </div>
              ) : booking.meetingLink ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Google Meet</p>
                        <p className="text-xs text-blue-700/80">Link is active during the scheduled time.</p>
                      </div>
                    </div>
                    <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
                      Join Meeting
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Session Notes:</strong> Please join 5 minutes early. Ensure your microphone and camera are working.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed rounded-lg text-muted-foreground">
                  <Video className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>Meeting link will be available closer to the session time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-sm">Amount Paid</span>
                <span className="font-bold">₹{((booking.payment?.amount || 0) / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge variant={booking.payment?.status === "SUCCESS" || booking.payment?.status === "PAID" ? "default" : "secondary"} className="bg-emerald-500 hover:bg-emerald-600">
                  {booking.payment?.status || "PAID"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground text-sm">Transaction ID</span>
                <span className="font-mono text-xs">{booking.payment?.razorpayPaymentId || "N/A"}</span>
              </div>
              
              <Link href={`/dashboard/bookings/${booking.id}/invoice`} target="_blank" className={cn(buttonVariants({ variant: "outline" }), "w-full mt-4")}>
                <Download className="h-4 w-4 mr-2" /> Download Invoice
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a href={`mailto:${booking.mentor.user?.email || ''}?subject=Support needed for Booking BK-${booking.id.slice(-8).toUpperCase()}`} className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
                <MessageSquare className="h-4 w-4 mr-2" /> Contact Mentor
              </a>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" /> Report an issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
