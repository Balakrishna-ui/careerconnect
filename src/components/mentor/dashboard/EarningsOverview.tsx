import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, ArrowUpRight } from "lucide-react";

interface EarningsOverviewProps {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayout: number;
}

export function EarningsOverview({ today, thisWeek, thisMonth, pendingPayout }: EarningsOverviewProps) {
  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-end">
        <div>
          <p className="text-emerald-100 font-medium mb-1">This Month</p>
          <h3 className="text-4xl font-bold tracking-tight">₹{thisMonth}</h3>
        </div>
        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="p-5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Today</p>
            <div className="text-xl font-bold flex items-center gap-1.5">
              ₹{today}
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">This Week</p>
            <div className="text-xl font-bold">₹{thisWeek}</div>
          </div>
        </div>
        
        <div className="p-5 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Pending Payout</p>
              <p className="text-xs text-muted-foreground">Available to withdraw</p>
            </div>
          </div>
          <div className="font-bold text-lg">₹{pendingPayout}</div>
        </div>
        
        {/* Placeholder for Graph */}
        <div className="p-5 border-t border-border">
          <div className="h-24 w-full rounded-lg bg-gradient-to-t from-primary/5 to-transparent border border-dashed border-primary/20 flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs font-medium">Earnings Graph Placeholder</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
