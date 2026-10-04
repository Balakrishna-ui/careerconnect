"use client";

import React from "react";
import { format } from "date-fns";
import { Receipt, Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function PaymentsPage() {
  const TRANSACTIONS = [
    { id: "TXN-847294", date: new Date(), description: "Pro Plan Subscription", amount: 2900, status: "SUCCESS", method: "Visa •••• 4242" },
    { id: "TXN-739211", date: new Date(Date.now() - 86400000 * 15), description: "1:1 Session with Sarah Jenkins", amount: 1500, status: "SUCCESS", method: "Visa •••• 4242" },
    { id: "TXN-128492", date: new Date(Date.now() - 86400000 * 45), description: "Resume Review Service", amount: 500, status: "REFUNDED", method: "Mastercard •••• 1234" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-2">View your transaction history and download invoices.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input className="pl-9 w-full" placeholder="Search transactions..." />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">Total Spent</p>
          <h2 className="text-3xl font-bold">₹4,400</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">Active Subscriptions</p>
          <h2 className="text-3xl font-bold">1 <span className="text-sm font-normal text-slate-500">Pro Plan</span></h2>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">Upcoming Payments</p>
          <h2 className="text-3xl font-bold">₹2,900 <span className="text-sm font-normal text-slate-500">in 15 days</span></h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{txn.id}</td>
                  <td className="px-6 py-4 text-slate-500">{format(txn.date, "MMM dd, yyyy")}</td>
                  <td className="px-6 py-4 font-medium">{txn.description}</td>
                  <td className="px-6 py-4 font-semibold">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">{txn.method}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={
                      txn.status === "SUCCESS" ? "bg-green-50 text-green-700 border-green-200" :
                      txn.status === "REFUNDED" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    }>
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#FF6B00]">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
