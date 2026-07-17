"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { RescheduleButton } from "@/components/booking/RescheduleButton";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, ArrowRight, Clock, Star, History, Loader2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { LeaveReviewModal } from "@/components/dashboard/LeaveReviewModal";
import useSWR from "swr";
import { getJobSeekerDashboardRealtime } from "@/actions/realtime-actions";

export function JobSeekerDashboardClient({
  userId,
  firstName,
  initialData,
  needsReviewBookings
}: {
  userId: string;
  firstName: string;
  initialData: any;
  needsReviewBookings: any[];
}) {
  const { data } = useSWR(
    `jobseeker-dashboard-${userId}`,
    () => getJobSeekerDashboardRealtime(userId),
    {
      fallbackData: initialData,
      refreshInterval: 3000, // Poll every 3 seconds
    }
  );

  const {
    totalSessions,
    completedSessions,
    amountSpent,
    upcomingBookings,
    pastBookings,
    allBookings,
  } = data || initialData;

  const now = new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">Manage your upcoming sessions and career progress.</p>
        </div>
        {!data && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Sessions Booked</p>
            <h3 className="text-2xl font-bold">{totalSessions}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Upcoming</p>
            <h3 className="text-2xl font-bold">{upcomingBookings.length}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
            <h3 className="text-2xl font-bold">{completedSessions}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Spent</p>
            <h3 className="text-2xl font-bold">₹{(amountSpent / 100).toLocaleString('en-IN')}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 shadow-sm border-none bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to get better mentor recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-2">
              <Progress value={65} className="h-2" />
              <span className="text-sm font-medium">65%</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Next step: <Link href="/profile" className="text-primary hover:underline font-medium">Add your resume</Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-muted/40">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/mentors" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
              <SearchIcon className="h-4 w-4 mr-2" /> Find a Mentor
            </Link>
            <Link href="/dashboard/bookmarks" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
              <BookmarkIcon className="h-4 w-4 mr-2" /> Saved Mentors
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Upcoming Sessions</h2>
              <Link href="/dashboard/sessions" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {upcomingBookings.length === 0 ? (
              <Card className="overflow-hidden shadow-sm border-border/50 bg-muted/20">
                <CardContent className="p-10 text-center flex flex-col items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-4">No upcoming sessions scheduled.</p>
                  <Link href="/mentors" className={cn(buttonVariants({ variant: "default" }))}>
                    Find a Mentor
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.slice(0, 3).map((booking: any) => {
                const isLive = new Date() >= new Date(booking.startTime) && new Date() <= new Date(booking.endTime);
                
                return (
                  <Card key={booking.id} className="overflow-hidden shadow-sm border-border/50 mb-4 transition-all hover:shadow-md">
                    <div className={cn("h-1 w-full", isLive ? "bg-red-500" : (booking.status === "PENDING" ? "bg-amber-400" : "bg-primary"))} />
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row border-b border-border/30">
                        {/* Left Info Area */}
                        <div className="p-5 flex-1 flex gap-4">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex-shrink-0 relative border">
                            {booking.mentor?.image ? (
                              <Image src={booking.mentor.image} alt={booking.mentor.name} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground bg-secondary/30">
                                {booking.mentor?.name?.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg leading-tight">{booking.mentor?.name}</h3>
                              {isLive && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold animate-pulse">Live Now</Badge>}
                              {booking.status === "PENDING" && <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border-amber-200">Pending Approval</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{booking.mentor?.company ? `${booking.mentor.role} at ${booking.mentor.company}` : booking.mentor?.role}</p>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                              <span className="flex items-center text-foreground/80">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(booking.date), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center text-foreground/80">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                              <span className="flex items-center text-foreground/80">
                                <Video className="h-3.5 w-3.5 mr-1" />
                                1:1 Mentorship Session
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Actions Area */}
                        <div className="p-5 bg-muted/10 sm:border-l border-border/30 flex flex-col justify-center gap-2 sm:w-[200px]">
                          {booking.meetingLink ? (
                            <a 
                              href={booking.meetingLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className={cn(buttonVariants({ variant: isLive ? "default" : "secondary" }), "w-full shadow-sm")}
                            >
                              <Video className="h-4 w-4 mr-2" /> Join Meeting
                            </a>
                          ) : (
                            <Button className="w-full shadow-sm" variant="secondary" disabled>
                              <Video className="h-4 w-4 mr-2" /> {booking.status === "PENDING" ? "Link Pending" : "Link Unavailable"}
                            </Button>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/dashboard/bookings/${booking.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs")}>
                              View
                            </Link>
                            <RescheduleButton 
                              bookingId={booking.id}
                              mentorId={booking.mentorId}
                              currentDate={new Date(booking.startTime)}
                              duration={Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)}
                              disabled={booking.rescheduleReq?.status === "PENDING" || isLive}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Past Sessions</h2>
              <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline flex items-center">
                View history <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <Card className="shadow-sm border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No past sessions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pastBookings.slice(0, 5).map((booking: any) => {
                      const amount = booking.payment?.amount ? booking.payment.amount / 100 : 0;
                      const isCompleted = booking.status === "COMPLETED" || new Date(booking.endTime) < now;
                      const displayStatus = isCompleted ? "Completed" : booking.status === "CANCELLED" ? "Cancelled" : booking.status === "REJECTED" ? "Rejected" : "Missed";
                      
                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold border overflow-hidden">
                                {booking.mentor?.image ? (
                                  <Image src={booking.mentor.image} alt="" width={32} height={32} className="object-cover" />
                                ) : (
                                  booking.mentor?.name?.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              {booking.mentor?.name || "Mentor"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{format(new Date(booking.date), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(booking.startTime), 'h:mm a')}</div>
                          </TableCell>
                          <TableCell>₹{amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              displayStatus === "Completed" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                              displayStatus === "Cancelled" && "bg-red-50 text-red-600 border-red-200",
                              displayStatus === "Rejected" && "bg-red-50 text-red-600 border-red-200",
                              displayStatus === "Missed" && "bg-amber-50 text-amber-600 border-amber-200",
                            )}>
                              {displayStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/bookings/${booking.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                                Details
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          {needsReviewBookings.length > 0 && (
            <Card className="shadow-sm border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Needs Review
                </CardTitle>
                <CardDescription className="text-amber-700/80">Leave feedback for your past mentors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {needsReviewBookings.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-xs">
                        {booking.mentor?.image ? (
                          <Image src={booking.mentor.image} alt="" width={36} height={36} className="object-cover" />
                        ) : (
                          booking.mentor?.name?.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{booking.mentor?.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(booking.date), 'MMM d')} Session</p>
                      </div>
                    </div>
                    <LeaveReviewModal 
                      bookingId={booking.id} 
                      mentorId={booking.mentorId} 
                      mentorName={booking.mentor?.name || "Mentor"} 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {allBookings.slice(0, 4).map((booking: any, idx: number) => (
                  <div key={booking.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <History className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 text-sm">Session {booking.status === "PENDING" ? "Requested" : booking.status === "CONFIRMED" ? "Confirmed" : booking.status === "REJECTED" ? "Rejected" : "Booked"}</div>
                        <time className="font-medium text-xs text-slate-500">{format(new Date(booking.createdAt), 'MMM d')}</time>
                      </div>
                      <div className="text-slate-500 text-xs">with {booking.mentor?.name}</div>
                    </div>
                  </div>
                ))}
                {allBookings.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4 relative z-10 bg-background">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Minimal icons specifically for this file
function SearchIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
}

function BookmarkIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
}
