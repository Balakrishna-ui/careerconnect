"use client";

import { useState } from "react";
import { ADMIN_PAYMENTS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, Calendar, Download, RefreshCcw, ExternalLink } from "lucide-react";
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

export default function PaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = ADMIN_PAYMENTS.filter(
    (p) =>
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mentorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Transactions</h1>
          <p className="text-sm text-muted-foreground">Monitor all payments, refunds, and gateway statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" /> Sync Gateway
          </Button>
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
                placeholder="Search by Transaction ID, User, or Mentor..."
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
                  <th className="px-6 py-4 font-medium">Transaction</th>
                  <th className="px-6 py-4 font-medium">Participants</th>
                  <th className="px-6 py-4 font-medium text-right">Amount (Gross)</th>
                  <th className="px-6 py-4 font-medium text-right">Tax (18%)</th>
                  <th className="px-6 py-4 font-medium text-right">Platform Fee (15%)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-medium bg-muted px-2 py-1 rounded inline-block mb-1">
                        {payment.transactionId}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {payment.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm"><span className="text-muted-foreground">From:</span> <span className="font-medium">{payment.userName}</span></div>
                        <div className="text-sm"><span className="text-muted-foreground">To:</span> <span className="font-medium">{payment.mentorName}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">
                      ${payment.tax}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 dark:text-blue-400 font-medium">
                      ${payment.commission}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={payment.status} />
                      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{payment.gateway}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" /> View in Razorpay
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download Invoice</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {payment.status === "success" && (
                            <DropdownMenuItem className="text-red-600">Refund Payment</DropdownMenuItem>
                          )}
                          {payment.status === "pending" && (
                            <DropdownMenuItem className="text-amber-600">Mark as Failed</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No payments found matching your search.
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
