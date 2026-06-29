"use client";

import { useState } from "react";
import { FRAUD_RECORDS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, ShieldAlert, AlertTriangle, ShieldCheck, Ban, CheckCircle } from "lucide-react";
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

export default function FraudDetection() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = FRAUD_RECORDS.filter(
    (f) =>
      f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fraud Detection & Security</h1>
          <p className="text-sm text-muted-foreground">Automated risk scoring and anomaly detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/50 dark:text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">High Risk Active</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full dark:bg-amber-900/50 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Under Investigation</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">System Status</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">Secure</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by User Name, Email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" /> Filter Risk Level
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Record ID</th>
                  <th className="px-6 py-4 font-medium">User Information</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium">Detected Flags</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{record.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-foreground">{record.userName} <span className="text-xs font-normal text-muted-foreground capitalize">({record.userType})</span></div>
                        <div className="text-xs text-muted-foreground">{record.email}</div>
                        <div className="text-xs text-muted-foreground">{record.mobile}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.riskScore} />
                    </td>
                    <td className="px-6 py-4 min-w-[300px]">
                      <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                        {record.flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-muted-foreground mt-2">Detected: {record.detectedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Take Action</DropdownMenuLabel>
                          <DropdownMenuItem>View Profile & Logs</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {record.status !== "banned" && (
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="w-4 h-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          )}
                          {record.status !== "cleared" && (
                            <DropdownMenuItem className="text-emerald-600">
                              <CheckCircle className="w-4 h-4 mr-2" /> Mark as Safe
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No fraud records found matching your search.
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
