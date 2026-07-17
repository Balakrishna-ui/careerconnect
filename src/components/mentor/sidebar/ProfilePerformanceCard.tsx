import { Card, CardContent } from "@/components/ui/card";
import { Info, TrendingUp, Search, Eye, Calendar, CheckCircle, Star, MessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfilePerformanceCardProps {
  searchViews: number;
  profileViews: number;
  bookings: number;
  completedSessions: number;
  responseRate: number;
  rating: number;
}

export function ProfilePerformanceCard({
  searchViews,
  profileViews,
  bookings,
  completedSessions,
  responseRate,
  rating
}: ProfilePerformanceCardProps) {
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Profile Performance</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Metrics calculated over the last 30 days.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            <Search className="w-4 h-4 text-blue-500 mb-1" />
            <div className="text-lg font-bold">{searchViews}</div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Search Views</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            <Calendar className="w-4 h-4 text-indigo-500 mb-1" />
            <div className="text-lg font-bold">{bookings}</div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Bookings</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            <MessageSquare className="w-4 h-4 text-emerald-500 mb-1" />
            <div className="text-lg font-bold">{responseRate}%</div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Response Rate</p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            <Star className="w-4 h-4 text-amber-500 mb-1" />
            <div className="text-lg font-bold">{rating.toFixed(1)}</div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Rating</p>
          </div>
          
        </div>
        
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Boost your profile performance</span>
          </div>
          <span className="text-blue-600 font-bold">&gt;</span>
        </div>
      </CardContent>
    </Card>
  );
}
