"use client";

import { Video, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TodaySessionCardProps {
  id: string;
  patientName: string;
  serviceTitle: string;
  timeStr: string;
  meetingLink: string | null;
  status: string; // CONFIRMED, COMPLETED, etc
  onMarkCompleted?: (id: string) => void;
}

export function TodaySessionCard({
  id,
  patientName,
  serviceTitle,
  timeStr,
  meetingLink,
  status,
  onMarkCompleted
}: TodaySessionCardProps) {
  const isCompleted = status === "COMPLETED";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-xl border ${isCompleted ? 'bg-muted/30 border-transparent' : 'bg-card border-border shadow-sm'} transition-all`}>
      <div className="flex items-center gap-4">
        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${isCompleted ? 'bg-muted text-muted-foreground' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'} shrink-0`}>
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-xs font-bold">{timeStr.split(' ')[0]}</span>
          <span className="text-[10px] font-medium leading-none">{timeStr.split(' ')[1]}</span>
        </div>
        
        <div>
          <h4 className={`font-bold ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{patientName}</h4>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">{serviceTitle}</p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-medium text-sm px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg w-full justify-center">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        ) : (
          <>
            {onMarkCompleted && (
              <Button 
                variant="outline" 
                className="rounded-xl shadow-sm"
                onClick={() => onMarkCompleted(id)}
              >
                Mark Completed
              </Button>
            )}
            {meetingLink ? (
              <Button 
                className="rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                onClick={() => window.open(meetingLink, '_blank')}
              >
                <Video className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            ) : (
              <Button variant="secondary" className="rounded-xl w-full sm:w-auto" disabled>
                <Video className="w-4 h-4 mr-2" />
                Link Pending
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
