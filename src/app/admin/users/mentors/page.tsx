"use client";

import { useState, useEffect } from "react";
import { getAdminMentors } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, Shield, Star, Clock, DollarSign, Download, Plus, Loader2 } from "lucide-react";
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

export default function MentorsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminMentors();
        setMentors(data);
      } catch (error) {
        console.error("Failed to load mentors", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Management</h1>
          <p className="text-sm text-muted-foreground">Manage all mentor profiles, verification, and status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Exporting mentors list as CSV...")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm" onClick={() => alert("Opening Add Mentor modal...")}>
            <Plus className="w-4 h-4 mr-2" /> Add Mentor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors by name, email, or company..."
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
                  <th className="px-6 py-4 font-medium">Mentor</th>
                  <th className="px-6 py-4 font-medium">Role & Company</th>
                  <th className="px-6 py-4 font-medium">Verification</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Performance</th>
                  <th className="px-6 py-4 font-medium">Earnings</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">Loading mentors...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMentors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No mentors found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={mentor.image} alt={mentor.name} className="w-10 h-10 rounded-full object-cover border" />
                          <div>
                            <div className="font-medium text-foreground">{mentor.name}</div>
                            <div className="text-xs text-muted-foreground">{mentor.email}</div>
                            <div className="text-xs text-muted-foreground">{mentor.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{mentor.designation}</div>
                        <div className="text-xs text-muted-foreground">{mentor.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={mentor.verificationStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={mentor.accountStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-medium">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "-"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{mentor.sessionsCompleted} sessions</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium flex items-center">
                          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                          {mentor.earnings.toLocaleString()}
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
                            <DropdownMenuItem>View Full Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Sessions</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {mentor.verificationStatus !== "verified" && (
                              <DropdownMenuItem className="text-emerald-600">Approve Verification</DropdownMenuItem>
                            )}
                            {mentor.accountStatus !== "suspended" ? (
                              <DropdownMenuItem className="text-amber-600">Suspend Account</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-emerald-600">Activate Account</DropdownMenuItem>
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
