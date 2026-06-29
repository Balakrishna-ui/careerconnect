"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Video,
  Loader2,
  CreditCard,
  PartyPopper,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getMentorBookingProfile,
  getAvailableDates,
  getAvailableSlots,
  createBooking,
  confirmBooking,
  getTestUser,
  type MentorBookingProfile,
  type AvailableDate,
  type TimeSlot,
} from "@/actions/booking-actions";

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { label: "Select Date", icon: Calendar },
  { label: "Select Time", icon: Clock },
  { label: "Payment", icon: CreditCard },
  { label: "Confirmed", icon: CheckCircle2 },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={i} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                isActive &&
                  "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                !isActive &&
                  !isDone &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-1",
                  i < current ? "bg-emerald-400" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Calendar Component ──────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  year,
  month,
  onChangeMonth,
}: {
  availableDates: AvailableDate[];
  selectedDate: string | null;
  onSelectDate: (d: string) => void;
  year: number;
  month: number;
  onChangeMonth: (y: number, m: number) => void;
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const availableSet = new Map<string, number>();
  availableDates.forEach((d) => availableSet.set(d.date, d.slotsCount));

  const prevMonth = () => {
    const prev = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    onChangeMonth(prevYear, prev);
  };

  const nextMonth = () => {
    const next = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    onChangeMonth(nextYear, next);
  };

  // Prevent navigating to past months
  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-bold">
          {MONTH_NAMES[month]} {year}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-muted-foreground py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isAvailable = availableSet.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const slotsCount = availableSet.get(dateStr) ?? 0;

          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
                !isAvailable &&
                  "text-muted-foreground/40 cursor-not-allowed bg-transparent",
                isAvailable &&
                  !isSelected &&
                  "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer",
                isSelected &&
                  "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105",
                isToday &&
                  !isSelected &&
                  "ring-2 ring-primary/40"
              )}
            >
              <span>{day}</span>
              {isAvailable && !isSelected && (
                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-normal leading-none">
                  {slotsCount} slot{slotsCount !== 1 ? "s" : ""}
                </span>
              )}
              {isSelected && (
                <span className="text-[10px] font-normal leading-none opacity-80">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted border border-border" />
          Unavailable
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary border border-primary" />
          Selected
        </div>
      </div>
    </div>
  );
}

// ─── Time Slot Picker ────────────────────────────────────────────────────────

function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  dateStr,
}: {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (s: string) => void;
  dateStr: string;
}) {
  const formatTime12 = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const date = new Date(dateStr + "T00:00:00");
  const formattedDate = date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const morningSlots = slots.filter((s) => {
    const h = parseInt(s.start.split(":")[0]);
    return h < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.start.split(":")[0]);
    return h >= 12 && h < 17;
  });

  const eveningSlots = slots.filter((s) => {
    const h = parseInt(s.start.split(":")[0]);
    return h >= 17;
  });

  const renderSection = (title: string, sectionSlots: TimeSlot[]) => {
    if (sectionSlots.length === 0) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {title}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sectionSlots.map((slot) => (
            <button
              key={slot.start}
              disabled={!slot.available}
              onClick={() => onSelectSlot(slot.start)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border",
                !slot.available &&
                  "bg-muted/30 text-muted-foreground/40 cursor-not-allowed border-transparent line-through",
                slot.available &&
                  slot.start !== selectedSlot &&
                  "bg-background border-border hover:border-primary hover:bg-primary/5 cursor-pointer",
                slot.start === selectedSlot &&
                  "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30"
              )}
            >
              {formatTime12(slot.start)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold">{formattedDate}</h3>
      </div>

      <div className="space-y-6">
        {renderSection("🌅 Morning", morningSlots)}
        {renderSection("☀️ Afternoon", afternoonSlots)}
        {renderSection("🌙 Evening", eveningSlots)}
      </div>

      {slots.filter((s) => s.available).length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            No available slots for this date
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Booking Page Component ─────────────────────────────────────────────

export default function BookingPageClient({
  mentorId,
}: {
  mentorId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  // Data
  const [mentor, setMentor] = useState<MentorBookingProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  // Selections
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Booking result
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    meetingLink: string;
    date: string;
    time: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load mentor profile ──
  useEffect(() => {
    startTransition(async () => {
      const [profile, user] = await Promise.all([
        getMentorBookingProfile(mentorId),
        getTestUser(),
      ]);
      setMentor(profile);
      if (user) setUserId(user.id);
    });
  }, [mentorId]);

  // ── Load available dates when month changes ──
  useEffect(() => {
    if (!mentorId) return;
    startTransition(async () => {
      const dates = await getAvailableDates(mentorId, calYear, calMonth);
      setAvailableDates(dates);
    });
  }, [mentorId, calYear, calMonth]);

  // ── Load slots when date changes ──
  useEffect(() => {
    if (!selectedDate) return;
    startTransition(async () => {
      const s = await getAvailableSlots(mentorId, selectedDate);
      setSlots(s);
    });
  }, [mentorId, selectedDate]);

  const handleDateSelect = useCallback((d: string) => {
    setSelectedDate(d);
    setSelectedSlot(null);
    setStep(1);
  }, []);

  const handleSlotSelect = useCallback((s: string) => {
    setSelectedSlot(s);
  }, []);

  const handleMonthChange = useCallback((y: number, m: number) => {
    setCalYear(y);
    setCalMonth(m);
    setSelectedDate(null);
    setSelectedSlot(null);
  }, []);

  const formatTime12 = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedSlot) {
      setStep(2);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDate || !selectedSlot || !userId || !mentor) return;

    setIsProcessing(true);

    try {
      // Step 1: Create booking
      const result = await createBooking({
        mentorId: mentor.id,
        userId,
        dateStr: selectedDate,
        startTime: selectedSlot,
      });

      if (!result.success) {
        alert(result.error);
        setIsProcessing(false);
        return;
      }

      // Step 2: Simulate Razorpay payment (mock)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 3: Confirm booking
      const confirmation = await confirmBooking({
        bookingId: result.bookingId!,
        razorpayPaymentId: `pay_${Date.now()}`,
      });

      if (confirmation.success) {
        setBookingResult({
          bookingId: result.bookingId!,
          meetingLink: confirmation.meetingLink!,
          date: selectedDate,
          time: selectedSlot,
        });
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = () => {
    if (bookingResult?.meetingLink) {
      navigator.clipboard.writeText(bookingResult.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-24">
      {/* Top Navigation */}
      <div className="bg-background border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/mentors/${mentorId}`}
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
          </Link>
          <span className="text-sm text-muted-foreground">
            Booking with <span className="font-semibold text-foreground">{mentor.name}</span>
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <StepIndicator current={step} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                {/* Step 0: Calendar */}
                {step === 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-1">Pick a Date</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Green dates have available time slots
                    </p>

                    {isPending && availableDates.length === 0 ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <BookingCalendar
                        availableDates={availableDates}
                        selectedDate={selectedDate}
                        onSelectDate={handleDateSelect}
                        year={calYear}
                        month={calMonth}
                        onChangeMonth={handleMonthChange}
                      />
                    )}
                  </div>
                )}

                {/* Step 1: Time Slots */}
                {step === 1 && selectedDate && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold">Pick a Time</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep(0);
                          setSelectedSlot(null);
                        }}
                        className="text-xs"
                      >
                        <ChevronLeft className="w-3 h-3 mr-1" /> Change Date
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {mentor.sessionDuration} min sessions with{" "}
                      {mentor.bufferTime} min buffer
                    </p>

                    {isPending ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <TimeSlotPicker
                          slots={slots}
                          selectedSlot={selectedSlot}
                          onSelectSlot={handleSlotSelect}
                          dateStr={selectedDate}
                        />

                        {selectedSlot && (
                          <div className="mt-8">
                            <Button
                              size="lg"
                              className="w-full h-14 text-base font-semibold shadow-md rounded-xl"
                              onClick={handleProceedToPayment}
                            >
                              Continue to Payment
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Payment Confirmation */}
                {step === 2 && selectedDate && selectedSlot && (
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      Confirm & Pay
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">
                      Review your booking details before payment
                    </p>

                    <div className="bg-muted/30 rounded-2xl p-6 space-y-4 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Mentor
                        </span>
                        <span className="font-semibold">{mentor.name}</span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Date
                        </span>
                        <span className="font-semibold">
                          {new Date(
                            selectedDate + "T00:00:00"
                          ).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Time
                        </span>
                        <span className="font-semibold">
                          {formatTime12(selectedSlot)}
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Duration
                        </span>
                        <span className="font-semibold">
                          {mentor.sessionDuration} Minutes
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Session Type
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Video className="w-4 h-4 text-primary" /> 1:1 Video
                          Call
                        </div>
                      </div>
                      <div className="border-t border-border" />
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold">
                          Total Amount
                        </span>
                        <span className="text-2xl font-extrabold text-primary">
                          ₹{mentor.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold shadow-md rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay ₹{mentor.price.toLocaleString()} via Razorpay
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setStep(1)}
                        disabled={isProcessing}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
                      </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Free cancellation up to 24 hours before the session
                    </p>
                  </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && bookingResult && (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PartyPopper className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">
                      Booking Confirmed! 🎉
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Your session with {mentor.name} has been booked
                      successfully.
                    </p>

                    <div className="bg-muted/30 rounded-2xl p-6 space-y-4 text-left mb-8 max-w-md mx-auto">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Mentor
                        </span>
                        <span className="font-semibold">{mentor.name}</span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Date
                        </span>
                        <span className="font-semibold">
                          {new Date(
                            bookingResult.date + "T00:00:00"
                          ).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Time
                        </span>
                        <span className="font-semibold">
                          {formatTime12(bookingResult.time)}
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Duration
                        </span>
                        <span className="font-semibold">
                          {mentor.sessionDuration} Minutes
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Amount Paid
                        </span>
                        <span className="font-bold text-emerald-600">
                          ₹{mentor.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Meeting Link */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-md mx-auto mb-8">
                      <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                        Meeting Link
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-background px-3 py-2 rounded-lg border truncate text-left">
                          {bookingResult.meetingLink}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 rounded-lg"
                          onClick={handleCopyLink}
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <a
                          href={bookingResult.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <Link href="/mentors" className="flex-1">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full rounded-xl"
                        >
                          Browse Mentors
                        </Button>
                      </Link>
                      <Link href="/dashboard" className="flex-1">
                        <Button
                          size="lg"
                          className="w-full rounded-xl"
                        >
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          {step < 3 && (
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="sticky top-32">
                <Card className="border-none shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    {/* Mentor info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative">
                        <img
                          src={
                            mentor.image ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=80`
                          }
                          alt={mentor.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-background shadow"
                        />
                        {mentor.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{mentor.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {mentor.role} @ {mentor.company}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold">
                            {mentor.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({mentor.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Session
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold"
                        >
                          <Video className="w-3 h-3 mr-1" /> 1:1 Video Call
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Duration
                        </span>
                        <span className="text-sm font-semibold">
                          {mentor.sessionDuration} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price
                        </span>
                        <span className="text-lg font-extrabold text-primary">
                          ₹{mentor.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Selection summary */}
                    {selectedDate && (
                      <div className="mt-5 pt-4 border-t border-border/40 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">
                            {new Date(
                              selectedDate + "T00:00:00"
                            ).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        {selectedSlot && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">
                              {formatTime12(selectedSlot)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Free cancellation up to 24h before
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
