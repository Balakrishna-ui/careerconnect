"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { CreditCard, Download, CheckCircle2, Clock, AlertCircle, Sparkles, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Invoice = {
  id: string;
  date: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  billingCycle: string;
  autoRenew: boolean;
};

type SubData = {
  subscription: Subscription | null;
  invoices: Invoice[];
  error?: string;
};

export default function SubscriptionsClient() {
  const { data, error, isLoading, mutate } = useSWR<SubData>("/api/subscriptions/me", fetcher);

  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await fetch("/api/seed/subscription", { method: "POST" });
    await mutate();
    setSeeding(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive font-medium">Failed to load subscription data.</p>
      </div>
    );
  }

  const hasSubscription = data?.subscription !== null;
  const sub = data?.subscription;
  const invoices = data?.invoices || [];

  const allBenefits = [
    { name: "Unlimited Mentor Bookings", tier: ["PRO", "PREMIUM"] },
    { name: "Priority Support", tier: ["PREMIUM"] },
    { name: "Featured Mentor Recommendations", tier: ["PRO", "PREMIUM"] },
    { name: "Faster Booking Access", tier: ["PRO", "PREMIUM"] },
    { name: "Resume Review Credits", tier: ["PREMIUM"] },
    { name: "Interview Preparation", tier: ["PREMIUM"] },
    { name: "Career Roadmap", tier: ["FREE", "PRO", "PREMIUM"] },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your CareerConnect membership and billing.</p>
      </div>

      {!hasSubscription ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center px-4">
          <div className="bg-orange-100 dark:bg-orange-950 p-6 rounded-full mb-6">
            <CreditCard className="w-12 h-12 text-[#FF6B00]" />
          </div>
          <h2 className="text-2xl font-bold mb-3">You don't have any active subscription.</h2>
          <p className="text-slate-500 max-w-md mb-8">
            Upgrade your account to unlock premium mentor sessions, priority support, and advanced career tools.
          </p>
          <div className="flex items-center gap-4">
            <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-orange-500/20">
              Browse Plans
            </Button>
            <Button variant="outline" onClick={handleSeed} disabled={seeding} className="rounded-full px-6 py-6 text-lg">
              {seeding ? "Seeding..." : "Seed Dummy Data"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {sub?.status === "EXPIRED" && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Your subscription has expired.</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">Renew now to continue enjoying premium features.</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm">Renew Subscription</Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Plan Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-950 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Plan</p>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        {sub?.plan}
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold px-2 py-0.5",
                          sub?.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
                          sub?.status === "EXPIRED" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
                          "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {sub?.status}
                        </Badge>
                      </h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">₹{(sub as any)?.amount?.toLocaleString() || "0"}</div>
                    <p className="text-sm text-slate-500 uppercase">{sub?.billingCycle}</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Start Date</p>
                    <p className="font-semibold">{sub?.startDate ? format(new Date(sub.startDate), "MMM dd, yyyy") : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Expiry Date</p>
                    <p className="font-semibold">{sub?.endDate ? format(new Date(sub.endDate), "MMM dd, yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Renewal Date</p>
                    <p className="font-semibold">{sub?.renewalDate ? format(new Date(sub.renewalDate), "MMM dd, yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Auto Renewal</p>
                    <p className="font-semibold flex items-center gap-2">
                      {sub?.autoRenew ? (
                        <><CheckCircle2 className="w-4 h-4 text-green-500" /> Enabled</>
                      ) : (
                        <><XCircle className="w-4 h-4 text-slate-400" /> Disabled</>
                      )}
                    </p>
                  </div>
                </div>
                {sub?.status === "ACTIVE" && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
                    <Button variant="outline" className="font-semibold">Cancel Subscription</Button>
                    <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white font-semibold">Manage Plan</Button>
                  </div>
                )}
              </div>

              {/* Billing History */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Billing History</h2>
                  <Button variant="ghost" size="sm" className="text-[#FF6B00] hover:text-[#e66000] hover:bg-orange-50">View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">Invoice ID</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Plan</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                            No billing history found.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                              #{invoice.id.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {format(new Date(invoice.date), "MMM dd, yyyy")}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {invoice.planName}
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              ₹{invoice.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={cn(
                                invoice.status === "PAID" ? "bg-green-50 text-green-700 border-green-200" :
                                invoice.status === "PENDING" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                "bg-slate-50 text-slate-700 border-slate-200"
                              )}>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#FF6B00]">
                                <Download className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              {/* Payment Information */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900">
                    <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                      <CreditCard className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Visa ending in 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/28</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8">Edit</Button>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Next Billing Date</span>
                      <span className="font-medium">{sub?.renewalDate ? format(new Date(sub.renewalDate), "MMM dd, yyyy") : "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-medium">₹{(sub as any)?.amount?.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Benefits */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold">Your Benefits</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {allBenefits.map((benefit, i) => {
                      const isActive = benefit.tier.includes(sub?.plan || "");
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <div className={cn("mt-0.5 rounded-full p-0.5", isActive ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className={cn("text-sm", isActive ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-600 line-through")}>
                            {benefit.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              
              {/* Upgrade Section (If not Premium) */}
              {sub?.plan !== "PREMIUM" && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <div className="p-6 relative z-10">
                    <Badge className="bg-[#FF6B00] hover:bg-[#e66000] text-white border-none mb-4">Recommended</Badge>
                    <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
                    <p className="text-slate-300 text-sm mb-6">
                      Get unlimited access to all features, priority support, and 5 free resume reviews every month.
                    </p>
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold group">
                      Compare Plans <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
