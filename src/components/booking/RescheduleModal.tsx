"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAvailableDates, getAvailableSlots, type AvailableDate, type TimeSlot } from "@/actions/booking-actions";
import { createRescheduleRequest } from "@/actions/reschedule-actions";

interface RescheduleModalProps {
  bookingId: string;
  mentorId: string;
  currentDate: Date;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RescheduleModal({ bookingId, mentorId, currentDate, isOpen, onClose, onSuccess }: RescheduleModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Calendar State
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedSlot(null);
      setReason("");
      fetchDates(year, month);
    }
  }, [isOpen, year, month]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchDates = async (y: number, m: number) => {
    setIsLoading(true);
    try {
      const dates = await getAvailableDates(mentorId, y, m);
      setAvailableDates(dates);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlots = async (dateStr: string) => {
    setIsLoading(true);
    try {
      // Assuming 60 mins duration for now, in a real app we fetch the original session duration
      const slots = await getAvailableSlots(mentorId, dateStr, 60);
      setAvailableSlots(slots);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedSlot) return;

    startTransition(async () => {
      const res = await createRescheduleRequest({
        bookingId,
        requestedDate: selectedDate,
        requestedTime: selectedSlot,
        reason,
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
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Reschedule Session</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Current: {format(currentDate, "PPP 'at' p")}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <Button variant="outline" size="sm" onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}>&lt;</Button>
                <h3 className="font-semibold">{MONTH_NAMES[month]} {year}</h3>
                <Button variant="outline" size="sm" onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}>&gt;</Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
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
                        disabled={slots === 0}
                        onClick={() => setSelectedDate(dStr)}
                        className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm transition-all ${
                          isSelected ? "bg-primary text-primary-foreground font-bold shadow-md" : 
                          slots > 0 ? "hover:bg-primary/10 hover:text-primary font-medium" : "opacity-30 cursor-not-allowed"
                        }`}
                      >
                        <span>{day}</span>
                        {slots > 0 && !isSelected && <span className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5"></span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedDate && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Select Time</h4>
                  {isLoading ? (
                    <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
                  ) : availableSlots.filter(s => s.available).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available slots on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.filter(s => s.available).map((s) => (
                        <button
                          key={s.start}
                          onClick={() => setSelectedSlot(s.start)}
                          className={`py-2 rounded-lg text-sm transition-colors border ${
                            selectedSlot === s.start ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
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
              <div className="bg-muted p-4 rounded-xl">
                <h4 className="font-semibold text-sm mb-2">Requested Time</h4>
                <p className="text-primary font-bold">
                  {selectedDate && format(new Date(selectedDate), "PPP")} at {selectedSlot}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                <Textarea 
                  placeholder="Let your mentor know why you need to reschedule..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="resize-none h-24"
                />
              </div>

              <div className="flex bg-amber-50 text-amber-800 p-3 rounded-lg text-xs items-start gap-2 border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Your session will not be updated until your mentor accepts this request. If they reject it, your original session will remain scheduled.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-2 bg-background mt-auto">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={!selectedDate || !selectedSlot} onClick={() => setStep(2)}>Next</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isPending}>Back</Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
