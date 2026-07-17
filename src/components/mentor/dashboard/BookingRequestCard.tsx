"use client";

import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface BookingRequestCardProps {
  id: string;
  patientName: string;
  patientImage: string | null;
  serviceTitle: string;
  dateStr: string;
  timeStr: string;
  duration: number;
  price: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isPending?: boolean;
}

export function BookingRequestCard({
  id,
  patientName,
  patientImage,
  serviceTitle,
  dateStr,
  timeStr,
  duration,
  price,
  onAccept,
  onReject,
  isPending
}: BookingRequestCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 bg-card border border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
      
      {/* Mentor Profile / Info */}
      <div className="flex gap-4 items-center md:items-start md:w-1/3">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-muted border shrink-0 relative flex items-center justify-center text-lg font-bold text-muted-foreground shadow-sm">
          {patientImage ? (
            <Image src={patientImage} alt={patientName} fill className="object-cover" />
          ) : (
            patientName.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h4 className="font-bold text-lg leading-tight">{patientName}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
            <span className="truncate">{serviceTitle}</span>
          </p>
        </div>
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-2 gap-4 md:w-1/3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-0.5">Requested Time</span>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {dateStr}
          </div>
          <div className="text-sm text-muted-foreground ml-5">{timeStr}</div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-0.5">Details</span>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {duration} Mins
          </div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold ml-5">₹{price}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:w-1/3 md:justify-end border-t md:border-t-0 border-border pt-4 md:pt-0">
        <Button 
          variant="outline" 
          className="w-full md:w-auto rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          onClick={() => onReject(id)}
          disabled={isPending}
        >
          Reject
        </Button>
        <Button 
          className="w-full md:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          onClick={() => onAccept(id)}
          disabled={isPending}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
