"use client";

import { useState, useEffect } from "react";
import { getAdminJobSeekers } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, DollarSign, Calendar, Download, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function JobSeekersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [seekers, setSeekers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminJobSeekers();
        setSeekers(data);
      } catch (error) {
        console.error("Failed to load job seekers", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSeekers = seekers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Seeker Management</h1>
          <p className="text-sm text-muted-foreground">Manage all job seeker accounts, bookings, and activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Job Seeker</th>
                  <th className="px-6 py-4 font-medium">Target Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Engagement</th>
                  <th className="px-6 py-4 font-medium">Total Spend</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">Loading job seekers...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSeekers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No job seekers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredSeekers.map((seeker) => (
                    <tr key={seeker.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={seeker.image} alt={seeker.name} className="w-10 h-10 rounded-full object-cover border" />
                          <div>
                            <div className="font-medium text-foreground">{seeker.name}</div>
                            <div className="text-xs text-muted-foreground">{seeker.email}</div>
                            <div className="text-xs text-muted-foreground">{seeker.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{seeker.targetRole}</div>
                        <div className="text-xs text-muted-foreground">{seeker.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={seeker.accountStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{seeker.sessionsBooked} sessions</div>
                        <div className="text-xs text-muted-foreground">Joined {seeker.joinedAt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium flex items-center">
                          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                          {seeker.totalSpend.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {seeker.lastActive}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Booking History</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {seeker.accountStatus !== "suspended" ? (
                              <DropdownMenuItem className="text-amber-600">
                                <Ban className="w-4 h-4 mr-2" /> Block Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-emerald-600">Unblock Account</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
