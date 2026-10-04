"use client";

import { useState, useEffect, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAvailableDates, getAvailableSlots, type AvailableDate, type TimeSlot } from "@/actions/booking-actions";
import { createRescheduleRequest } from "@/actions/reschedule-actions";

interface RescheduleModalProps {
  bookingId: string;
  mentorId: string;
  currentDate: Date;
  duration: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RescheduleModal({
  bookingId,
  mentorId,
  currentDate,
  duration,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validCurrentDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : new Date();
  const [year, setYear] = useState(() => validCurrentDate.getFullYear());
  const [month, setMonth] = useState(() => validCurrentDate.getMonth());

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedSlot(null);
      setReason("");
      setFetchError(null);
      const initDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : new Date();
      const initYear = initDate.getFullYear();
      const initMonth = initDate.getMonth();
      setYear(initYear);
      setMonth(initMonth);
      fetchDates(initYear, initMonth);
    }
  }, [isOpen, mentorId]);

  const fetchDates = async (y: number, m: number) => {
    setIsLoadingDates(true);
    setFetchError(null);
    try {
      const dates = await getAvailableDates(mentorId, y, m, duration);
      setAvailableDates(Array.isArray(dates) ? dates : []);
    } catch (e: any) {
      console.error("Failed to load available dates:", e);
      setFetchError("Unable to fetch available dates for this mentor. Please try again.");
      setAvailableDates([]);
    } finally {
      setIsLoadingDates(false);
    }
  };

  const handlePrevMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetchDates(newYear, newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetchDates(newYear, newMonth);
  };

  const handleSelectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setIsLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(mentorId, dateStr, duration);
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (e) {
      console.error("Failed to load time slots:", e);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedSlot) return;
    if (!reason.trim()) {
      alert("Please provide a reason for the reschedule request.");
      return;
    }

    startTransition(async () => {
      const res = await createRescheduleRequest({
        bookingId,
        requestedDate: selectedDate,
        requestedTime: selectedSlot,
        reason: reason.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.error || "Failed to submit request.");
      }
    });
  };

  if (!isOpen) return null;

  // Render Calendar
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const availableSet = new Map<string, number>();
  availableDates.forEach((d) => availableSet.set(d.date, d.slotsCount));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Session</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Current: {format(validCurrentDate, "PPP 'at' p")}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              {/* Month Selector */}
              <div className="flex items-center justify-between mb-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth} disabled={isLoadingDates}>
                  &lt;
                </Button>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {MONTH_NAMES[month]} {year}
                </h3>
                <Button variant="outline" size="sm" onClick={handleNextMonth} disabled={isLoadingDates}>
                  &gt;
                </Button>
              </div>

              {isLoadingDates ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs">Checking mentor availability...</span>
                </div>
              ) : fetchError ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-xl text-center text-xs space-y-2">
                  <p>{fetchError}</p>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => fetchDates(year, month)}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="text-center text-xs font-semibold py-2 text-muted-foreground">{d}</div>
                    ))}
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} className="aspect-square" />;
                      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const slots = availableSet.get(dStr) || 0;
                      const isSelected = selectedDate === dStr;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={slots === 0}
                          onClick={() => handleSelectDate(dStr)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-md"
                              : slots > 0
                              ? "hover:bg-primary/10 hover:text-primary font-medium cursor-pointer border border-transparent hover:border-primary/30 text-slate-800 dark:text-slate-100"
                              : "opacity-25 cursor-not-allowed text-muted-foreground"
                          }`}
                        >
                          <span>{day}</span>
                          {slots > 0 && !isSelected && <span className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5"></span>}
                        </button>
                      );
                    })}
                  </div>

                  {availableDates.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      No availability found for {MONTH_NAMES[month]} {year}.
                    </p>
                  )}
                </>
              )}

              {/* Time Slots Section */}
              {selectedDate && (
                <div className="pt-4 border-t border-border/60">
                  <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-white">
                    Available Time Slots for {format(parseISO(selectedDate), "MMM d, yyyy")}
                  </h4>
                  {isLoadingSlots ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : availableSlots.filter((s) => s.available).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No available slots remaining on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots
                        .filter((s) => s.available)
                        .map((s) => (
                          <button
                            key={s.start}
                            type="button"
                            onClick={() => setSelectedSlot(s.start)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                              selectedSlot === s.start
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "border-border/80 hover:border-primary/50 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {s.start}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-muted/50 border border-border/50 p-4 rounded-xl space-y-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Current:</span> {format(validCurrentDate, "PPP 'at' p")}
                </div>
                <div className="text-xs text-primary font-bold">
                  <span className="text-foreground">Requested:</span> {selectedDate && format(new Date(selectedDate), "PPP")} at {selectedSlot}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-800 dark:text-white">
                  Reason for Rescheduling <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  placeholder="Explain why you need to reschedule this session..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none h-24 rounded-xl"
                  required
                />
              </div>

              <div className="flex bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-3 rounded-xl text-xs items-start gap-2 border border-amber-200 dark:border-amber-900/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>Your session will be updated once your mentor reviews and accepts this request. The request will be sent directly to your mentor.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t flex justify-end gap-2 bg-background mt-auto">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={!selectedDate || !selectedSlot} onClick={() => setStep(2)}>Next</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isPending}>Back</Button>
              <Button onClick={handleSubmit} disabled={isPending || !reason.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Reschedule
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
