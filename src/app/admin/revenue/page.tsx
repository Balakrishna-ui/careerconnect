"use client";

import { KPICard } from "@/components/admin/KPICard";
import { DollarSign, Download, ArrowUpRight, ArrowDownRight, CreditCard, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { getAdminKPIs, getAdminRevenueTrend } from "@/actions/admin-dashboard-actions";

export default function RevenueManagement() {
  const fetcher = <T,>(action: () => Promise<T>) => action();
  const refreshInterval = 10000; // Poll every 10 seconds

  const { data: kpis, isLoading: loadingKpis } = useSWR('kpis', () => fetcher(getAdminKPIs), { refreshInterval });
  const { data: revenueTrend, isLoading: loadingTrend } = useSWR('revenueTrend', () => fetcher(getAdminRevenueTrend), { refreshInterval });

  // Calculate total commission and payouts
  const totalCommission = revenueTrend?.reduce((acc, curr) => acc + curr.commission, 0) || 0;
  const totalPayouts = revenueTrend?.reduce((acc, curr) => acc + curr.payouts, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Management</h1>
          <p className="text-sm text-muted-foreground">Financial analytics, platform commissions, and payout reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingKpis || !kpis ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-muted/20 h-28" />
          ))
        ) : (
          <>
            <KPICard title="Total Revenue (YTD)" value={kpis.totalRevenue} icon={DollarSign} valuePrefix="₹" trend={kpis.revenueGrowth} />
            <KPICard title="Platform Commission (15%)" value={totalCommission} icon={Landmark} valuePrefix="₹" />
            <KPICard title="Mentor Payouts" value={totalPayouts} icon={CreditCard} valuePrefix="₹" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Revenue Trend</CardTitle>
            <CardDescription>Monthly gross transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {loadingTrend || !revenueTrend ? (
                <div className="w-full h-full animate-pulse bg-muted/20 rounded-md" />
              ) : revenueTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorRevenueGraph" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueGraph)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commission vs Payouts Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Split</CardTitle>
            <CardDescription>Platform commission vs Mentor payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {loadingTrend || !revenueTrend ? (
                <div className="w-full h-full animate-pulse bg-muted/20 rounded-md" />
              ) : revenueTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="commission" name="Platform Commission" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="payouts" name="Mentor Payouts" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loadingTrend || !revenueTrend ? (
               <div className="p-8 text-center text-muted-foreground animate-pulse">Loading financial summary...</div>
            ) : revenueTrend.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">No financial data found</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Month</th>
                    <th className="px-6 py-4 font-medium text-right">Gross Revenue</th>
                    <th className="px-6 py-4 font-medium text-right">Platform Commission (15%)</th>
                    <th className="px-6 py-4 font-medium text-right">Mentor Payouts (85%)</th>
                    <th className="px-6 py-4 font-medium text-right">MoM Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...revenueTrend].reverse().map((data, idx, arr) => {
                    const prevData = arr[idx + 1];
                    const growth = prevData && prevData.revenue > 0 ? ((data.revenue - prevData.revenue) / prevData.revenue) * 100 : 0;
                    return (
                      <tr key={data.month} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{data.month}</td>
                        <td className="px-6 py-4 text-right font-medium">₹{data.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-medium">₹{data.commission.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-purple-600 dark:text-purple-400 font-medium">₹{data.payouts.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          {growth !== 0 ? (
                            <div className={`flex items-center justify-end gap-1 ${growth > 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {growth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              {Math.abs(growth).toFixed(1)}%
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
