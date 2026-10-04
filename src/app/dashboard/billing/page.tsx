"use client";

import React from "react";
import { CreditCard, Receipt, Wallet, ArrowUpRight, ArrowDownRight, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing Overview</h1>
        <p className="text-muted-foreground mt-2">Manage your wallet, invoices, and financial summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#FF6B00] to-[#e66000] text-white rounded-2xl p-6 shadow-md">
          <p className="text-orange-100 font-medium mb-1">Wallet Balance</p>
          <h2 className="text-4xl font-bold mb-4">₹1,500</h2>
          <Button className="w-full bg-white text-[#FF6B00] hover:bg-orange-50 font-semibold">Add Funds</Button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">Total Spent</p>
            <h2 className="text-2xl font-bold">₹4,400</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">Active Subscriptions</p>
            <h2 className="text-2xl font-bold">1 <span className="text-sm font-normal text-slate-500">Pro Plan</span></h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mb-3">
              <ArrowDownRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">Refund History</p>
            <h2 className="text-2xl font-bold">₹500</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Invoice #INV-2026-0{i}</p>
                    <p className="text-xs text-slate-500">Aug 0{i}, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">₹{i === 1 ? '2,900' : '1,500'}</span>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#FF6B00]">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold">Payment Methods</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-[#FF6B00] rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm">
                  <CreditCard className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <p className="font-bold">Visa ending in 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/28</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#FF6B00] bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-md">Default</span>
            </div>
            
            <Button variant="outline" className="w-full border-dashed border-2 py-8 text-slate-500 hover:border-[#FF6B00] hover:text-[#FF6B00]">
              + Add New Payment Method
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
