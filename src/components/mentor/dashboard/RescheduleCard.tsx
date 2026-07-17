"use client";

import { ArrowRight, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface RescheduleCardProps {
  id: string;
  patientName: string;
  patientImage: string | null;
  oldDateStr: string;
  oldTimeStr: string;
  newDateStr: string;
  newTimeStr: string;
  reason: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending?: boolean;
}

export function RescheduleCard({
  id,
  patientName,
  patientImage,
  oldDateStr,
  oldTimeStr,
  newDateStr,
  newTimeStr,
  reason,
  onApprove,
  onReject,
  isPending
}: RescheduleCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 bg-card border border-amber-200/50 shadow-sm rounded-2xl hover:shadow-md transition-shadow relative overflow-hidden group flex-wrap">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
      
      {/* Mentor Profile / Info */}
      <div className="flex gap-4 items-center md:items-start md:w-[30%]">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border shrink-0 relative flex items-center justify-center text-lg font-bold text-muted-foreground shadow-sm">
          {patientImage ? (
            <Image src={patientImage} alt={patientName} fill className="object-cover" />
          ) : (
            patientName.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h4 className="font-bold text-lg leading-tight">{patientName}</h4>
          <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1">Requested Reschedule</p>
        </div>
      </div>

      {/* Date & Time Change */}
      <div className="flex flex-1 items-center gap-4 justify-between bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
        <div className="flex-1 text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1">Old Time</span>
          <div className="font-semibold text-foreground/70 line-through text-sm">{oldDateStr}</div>
          <div className="text-sm text-muted-foreground line-through">{oldTimeStr}</div>
        </div>
        
        <div className="shrink-0 text-amber-500">
          <ArrowRight className="w-5 h-5" />
        </div>
        
        <div className="flex-1 text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-500 block mb-1">Requested</span>
          <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{newDateStr}</div>
          <div className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">{newTimeStr}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-2 md:w-[20%] shrink-0">
        <Button 
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9"
          onClick={() => onApprove(id)}
          disabled={isPending}
        >
          Approve
        </Button>
        <Button 
          variant="outline" 
          className="w-full rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-9"
          onClick={() => onReject(id)}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>
      
      {/* Reason full width if exists */}
      {reason && (
        <div className="w-full mt-2 text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-lg italic border-l-2 border-border flex items-start gap-2 basis-full">
          <span className="font-semibold text-foreground not-italic shrink-0">Reason:</span> {reason}
        </div>
      )}
    </div>
  );
}
