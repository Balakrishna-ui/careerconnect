import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ChevronRight, Video } from "lucide-react";
import Link from "next/link";

export interface CalendarEvent {
  id: string;
  day: string; // e.g. "MON"
  time: string; // e.g. "9 AM"
  title: string;
  patientName: string;
}

interface PremiumCalendarViewProps {
  events: CalendarEvent[];
}

export function PremiumCalendarView({ events }: PremiumCalendarViewProps) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Week
        </CardTitle>
        <Link href="/mentor/dashboard/calendar" className="text-sm text-primary hover:underline font-medium flex items-center">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Calendar className="w-10 h-10 mb-3 opacity-20" />
              <p>No upcoming sessions this week.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex hover:bg-muted/30 transition-colors p-4 gap-4 items-center group">
                <div className="w-12 shrink-0 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{event.day}</span>
                  <span className="font-bold text-foreground">{event.time}</span>
                </div>
                
                <div className="w-1 h-10 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    With {event.patientName}
                  </p>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
