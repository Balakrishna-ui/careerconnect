import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Video, DollarSign, Calendar, Users, TrendingUp, Check, X } from "lucide-react";

export default function MentorDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage your availability, sessions, and earnings.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" /> Edit Availability
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
              <TrendingUp className="h-3 w-3 mr-1" /> +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
            <div className="text-2xl font-bold text-primary">3</div>
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
            {[1, 2].map((i) => (
              <Card key={i} className="shadow-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {i === 1 ? 'AL' : 'JS'}
                      </div>
                      <div>
                        <h4 className="font-bold">{i === 1 ? 'Alex Lin' : 'James Smith'}</h4>
                        <p className="text-xs text-muted-foreground">Requested a 60 min session</p>
                        <p className="text-xs font-medium text-primary mt-1">Oct {24 + i}, 10:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10">
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700">
                        <Check className="h-4 w-4 mr-1" /> Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <TableRow>
                  <TableCell className="font-medium">Sarah Jenkins</TableCell>
                  <TableCell>
                    <div className="text-sm">Today</div>
                    <div className="text-xs text-muted-foreground">2:00 PM EST</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="secondary" className="gap-2">
                      <Video className="h-3 w-3" /> Join
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Michael Chen</TableCell>
                  <TableCell>
                    <div className="text-sm">Tomorrow</div>
                    <div className="text-xs text-muted-foreground">11:00 AM EST</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-2 opacity-50 cursor-not-allowed">
                      <Video className="h-3 w-3" /> Join
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>
      </div>
    </div>
  );
}
