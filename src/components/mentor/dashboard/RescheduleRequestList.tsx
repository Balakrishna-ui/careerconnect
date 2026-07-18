"use client";

import { useState } from "react";
import { RescheduleCard } from "./RescheduleCard";
import { acceptRescheduleRequest, rejectRescheduleRequest } from "@/actions/reschedule-actions";

export function RescheduleRequestList({ requests }: { requests: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await acceptRescheduleRequest(id);
    if (!res.success) {
      alert(res.error || "Failed to approve");
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const res = await rejectRescheduleRequest(id);
    if (!res.success) {
      alert(res.error || "Failed to reject");
    }
    setLoadingId(null);
  };

  if (requests.length === 0) {
    return <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-dashed border-border text-center">No reschedule requests at the moment.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <RescheduleCard
          key={req.id}
          id={req.id}
          patientName={req.booking.user.name}
          patientImage={req.booking.user.image}
          oldDateStr={req.oldDate.toLocaleDateString()}
          oldTimeStr={req.oldStartTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })}
          newDateStr={req.requestedDate.toLocaleDateString()}
          newTimeStr={req.requestedTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })}
          reason={req.reason}
          onApprove={handleApprove}
          onReject={handleReject}
          isPending={loadingId === req.id}
        />
      ))}
    </div>
  );
}
