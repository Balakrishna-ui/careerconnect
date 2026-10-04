"use client";

import React, { useState, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, Info, Calendar, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requestBookingCancellationAction } from "@/actions/cancellation-actions";
import { toast } from "sonner";

interface CancellationModalProps {
  bookingId: string;
  mentorName: string;
  sessionTitle: string;
  startTime: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancellationModal({
  bookingId,
  mentorName,
  sessionTitle,
  startTime,
  price,
  isOpen,
  onClose,
  onSuccess,
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const sessionStart = new Date(startTime);
  const now = new Date();
  const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isEligibleForFullRefund = hoursUntilSession >= 24;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Please provide a cancellation reason (minimum 5 characters).");
      return;
    }

    startTransition(async () => {
      const res = await requestBookingCancellationAction(bookingId, reason.trim());
      if (res.success) {
        toast.success(res.message || "Cancellation request sent to mentor.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to submit cancellation request.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cancel Booking</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit a cancellation request for mentor review
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Session Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                <span className="truncate">{sessionTitle || "1:1 Mentorship Session"}</span>
                <span className="text-slate-700 dark:text-slate-300">₹{price}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{format(sessionStart, "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{format(sessionStart, "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Mentor: <strong>{mentorName}</strong></span>
                </div>
              </div>
            </div>

            {/* Refund Policy Information */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                isEligibleForFullRefund
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
              }`}
            >
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isEligibleForFullRefund ? "text-emerald-600" : "text-amber-600"}`} />
              <div className="space-y-1">
                <p className="font-semibold">
                  {isEligibleForFullRefund
                    ? "Eligible for 100% Refund (24h Policy)"
                    : "No Refund Notice (< 24h Policy)"}
                </p>
                <p className="leading-relaxed">
                  {isEligibleForFullRefund
                    ? `Because your session is more than 24 hours away, ₹${price} will be refunded to your original payment method once your mentor approves the cancellation.`
                    : `Since your session is scheduled within the next 24 hours, this session is outside the refundable window according to the platform refund policy.`}
                </p>
              </div>
            </div>

            {/* Reason Textarea (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="cancel-reason" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Why are you cancelling this booking? <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancel-reason"
                placeholder="Please explain the reason for cancelling this session..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none h-28 rounded-xl border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                required
                disabled={isPending}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This reason will be shared with your mentor so they can review your request.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl font-medium"
            >
              Keep Booking
            </Button>
            <Button
              type="submit"
              disabled={isPending || !reason.trim() || reason.trim().length < 5}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Cancellation Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
