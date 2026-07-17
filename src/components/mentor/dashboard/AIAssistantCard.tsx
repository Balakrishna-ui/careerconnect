import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AIAssistantCardProps {
  summary: {
    bookingRequests: number;
    rescheduleRequests: number;
    earningsToday: number;
    nextSessionTime: string | null;
  }
}

export function AIAssistantCard({ summary }: AIAssistantCardProps) {
  return (
    <Card className="shadow-sm border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          CareerConnect AI
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Today's Summary</p>
        
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2 text-sm font-medium">
            <span className="text-primary mt-0.5">•</span>
            {summary.bookingRequests > 0 
              ? `You have ${summary.bookingRequests} booking requests needing attention.`
              : "No pending booking requests."}
          </li>
          <li className="flex items-start gap-2 text-sm font-medium">
            <span className="text-amber-500 mt-0.5">•</span>
            {summary.rescheduleRequests > 0 
              ? `${summary.rescheduleRequests} sessions want to reschedule.`
              : "No reschedule requests."}
          </li>
          <li className="flex items-start gap-2 text-sm font-medium">
            <span className="text-emerald-500 mt-0.5">•</span>
            Earnings today: ₹{summary.earningsToday}
          </li>
          <li className="flex items-start gap-2 text-sm font-medium">
            <span className="text-blue-500 mt-0.5">•</span>
            {summary.nextSessionTime 
              ? `Next session is at ${summary.nextSessionTime}`
              : "No more sessions today."}
          </li>
        </ul>
        
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 mb-4">
          <p className="text-xs italic text-foreground/80">
            "Your response rate is excellent. Keep approving sessions to maintain your top mentor status!"
          </p>
        </div>
        
        <Link href="/mentor/analytics" className="block w-full">
          <Button variant="default" className="w-full rounded-xl shadow-sm group">
            View Detailed Insights
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
