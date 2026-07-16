"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { acceptRescheduleRequest, rejectRescheduleRequest } from "@/actions/reschedule-actions";

export function RescheduleRequestActions({ requestId }: { requestId: string }) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    const res = await acceptRescheduleRequest(requestId);
    if (!res.success) {
      alert(res.error || "Failed to accept");
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    const res = await rejectRescheduleRequest(requestId);
    if (!res.success) {
      alert(res.error || "Failed to reject");
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button 
        size="sm" 
        variant="outline" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleReject}
        disabled={isAccepting || isRejecting}
      >
        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
        Reject
      </Button>
      <Button 
        size="sm" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={handleAccept}
        disabled={isAccepting || isRejecting}
      >
        {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
        Accept
      </Button>
    </div>
  );
}
