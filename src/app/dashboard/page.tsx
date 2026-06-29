import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Calendar, Video, ArrowRight, Clock, Star } from "lucide-react";

export default function JobSeekerDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h1>
        <p className="text-muted-foreground">Manage your upcoming sessions and career progress.</p>
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
            
            <Card className="overflow-hidden shadow-sm border-border/50">
              <div className="h-2 w-full bg-emerald-500" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="bg-muted h-16 w-16 rounded-xl flex flex-col items-center justify-center border text-center">
                      <span className="text-xs font-medium uppercase text-muted-foreground">Oct</span>
                      <span className="text-xl font-bold leading-none">24</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Mock Interview & Resume Review</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> 10:00 AM - 11:00 AM EST
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          SC
                        </div>
                        <span className="text-sm font-medium">with Sarah Chen (Google)</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <Link href="#" className={cn(buttonVariants(), "w-full sm:w-auto gap-2")}>
                      <Video className="h-4 w-4" /> Join Call
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Past Sessions</h2>
            <Card className="shadow-sm border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Marcus Johnson</TableCell>
                    <TableCell>Sep 12, 2023</TableCell>
                    <TableCell>Career Guidance</TableCell>
                    <TableCell><Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Completed</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Elena Rodriguez</TableCell>
                    <TableCell>Aug 05, 2023</TableCell>
                    <TableCell>Portfolio Review</TableCell>
                    <TableCell><Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Completed</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Needs Review</CardTitle>
              <CardDescription>Leave feedback for your past mentors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                    MJ
                  </div>
                  <div>
                    <p className="text-sm font-bold">Marcus Johnson</p>
                    <p className="text-xs text-muted-foreground">Sep 12 Session</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Star className="h-4 w-4" />
                </Button>
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
