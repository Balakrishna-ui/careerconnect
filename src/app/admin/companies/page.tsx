"use client";

import { useState } from "react";
import { ADMIN_COMPANIES } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, Plus, Building2, Users, CalendarDays } from "lucide-react";
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

export default function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = ADMIN_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies Management</h1>
          <p className="text-sm text-muted-foreground">Manage verified companies and partner organizations.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Company
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search companies or industries..."
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
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Mentors</th>
                  <th className="px-6 py-4 font-medium">Sessions Hosted</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Added On</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center p-1 overflow-hidden">
                          <img src={company.logo} alt={company.name} className="w-full h-full object-contain" onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                          }} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{company.mentorCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{company.sessionCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {company.addedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>View Mentors</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {company.status === "active" ? (
                            <DropdownMenuItem className="text-amber-600">Deactivate</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600">Activate</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No companies found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
