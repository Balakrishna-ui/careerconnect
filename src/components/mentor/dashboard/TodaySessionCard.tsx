"use client";

import { Video, Clock, CheckCircle, Copy, Check, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionWindow } from "@/lib/session-utils";
import Link from "next/link";

interface TodaySessionCardProps {
  id: string;
  patientName: string;
  serviceTitle: string;
  timeStr: string;
  meetingLink: string | null;
  status: string; // CONFIRMED, COMPLETED, MISSED, EXPIRED
  startTime: string;
  endTime: string;
  onMarkCompleted?: (id: string) => void;
  isSubmitting?: string | null;
}

export function TodaySessionCard({
  id,
  patientName,
  serviceTitle,
  timeStr,
  meetingLink,
  status,
  startTime,
  endTime,
  onMarkCompleted,
  isSubmitting
}: TodaySessionCardProps) {
  const [copied, setCopied] = useState(false);
  
  const isCompleted = status === "COMPLETED";
  const isMissed = status === "MISSED";
  const isExpired = status === "EXPIRED";
  
  const windowStatus = getSessionWindow({ startTime: new Date(startTime), endTime: new Date(endTime), status });
  const canJoin = windowStatus === 'in_window' && !isCompleted && !isMissed && !isExpired;

  const handleCopyLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="bg-primary/5 p-4 sm:w-32 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border shrink-0">
          <Clock className="w-5 h-5 text-primary mb-2" />
          <div className="font-bold text-center text-sm">{timeStr.split(' ')[0]}</div>
          <div className="text-xs text-muted-foreground mt-1">{timeStr.split(' ')[1]}</div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-lg">{patientName}</h4>
              <p className="text-sm text-muted-foreground">{serviceTitle}</p>
            </div>
            {isCompleted && (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 flex gap-1 items-center">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </Badge>
            )}
            {isMissed && (
              <Badge variant="destructive" className="flex gap-1 items-center">
                <AlertCircle className="w-3 h-3" />
                Missed
              </Badge>
            )}
            {isExpired && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <AlertCircle className="w-3 h-3" />
                Expired
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted/30 sm:w-64 flex items-center justify-end gap-2 border-t sm:border-t-0 sm:border-l border-border shrink-0">
          {isCompleted || isMissed || isExpired ? (
            <Link 
              href={`/bookings/${id}`}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              View Details
            </Link>
          ) : (
            <>
              {onMarkCompleted && canJoin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl shadow-sm shrink-0 font-medium border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => onMarkCompleted(id)}
                  disabled={isSubmitting === id}
                >
                  {isSubmitting === id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Mark Completed
                </Button>
              )}
              {meetingLink ? (
                <>
                  {canJoin && (
                    <Button 
                      variant="outline"
                      size="icon"
                      className="rounded-xl shadow-sm shrink-0"
                      onClick={handleCopyLink}
                      title="Copy Meeting Link"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    className="rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    onClick={() => window.open(meetingLink, '_blank')}
                    disabled={!canJoin}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {canJoin ? "Join Meeting" : (windowStatus === 'before_window' ? "Available Soon" : "Ended")}
                  </Button>
                </>
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
    </Card>
  );
}
