"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  AlertCircle,
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
  type MentorBookingProfile,
  type AvailableDate,
  type TimeSlot,
} from "@/actions/booking-actions";
import { useSession } from "next-auth/react";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { label: "Select Service", icon: Star },
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
  const searchParams = useSearchParams();
  const initialServiceId = searchParams?.get("service") || null;
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId);

  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(initialServiceId ? 1 : 0);

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

  const selectedService = mentor?.services?.find(s => s.id === selectedServiceId);

  // Booking result
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    meetingLink: string;
    date: string;
    time: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ── Load mentor profile ──
  useEffect(() => {
    startTransition(async () => {
      const profile = await getMentorBookingProfile(mentorId);
      setMentor(profile);
    });
  }, [mentorId]);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session?.user?.id]);

  // ── Load available dates when month changes ──
  const fetchAvailableDates = useCallback(() => {
    if (!mentorId || !selectedService) return;
    setHasError(false);
    startTransition(async () => {
      try {
        const dates = await getAvailableDates(mentorId, calYear, calMonth, selectedService.duration);
        setAvailableDates(dates);
      } catch (err) {
        setHasError(true);
      }
    });
  }, [mentorId, selectedService, calYear, calMonth]);

  useEffect(() => {
    fetchAvailableDates();
  }, [fetchAvailableDates]);

  // ── Load slots when date changes ──
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    startTransition(async () => {
      const s = await getAvailableSlots(mentorId, selectedDate, selectedService.duration);
      setSlots(s);
    });
  }, [mentorId, selectedDate, selectedService]);

  const handleDateSelect = useCallback((d: string) => {
    setSelectedDate(d);
    setSelectedSlot(null);
    setStep(2);
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
      if (status === "unauthenticated") {
        setShowLoginModal(true);
      } else {
        setStep(3);
      }
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDate || !selectedSlot || !userId || !mentor || !selectedServiceId) return;

    setIsProcessing(true);

    try {
      // Step 1: Create booking and Razorpay order
      const result = await createBooking({
        mentorId,
        userId,
        serviceId: selectedServiceId,
        dateStr: selectedDate,
        startTime: selectedSlot,
      });

      if (!result.success) {
        alert(result.error);
        setIsProcessing(false);
        return;
      }

      // Step 2: Load Razorpay
      const res = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Step 3: Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        amount: result.amount! * 100,
        currency: "INR",
        name: "CareerConnect",
        description: `Session Booking with ${mentor.name}`,
        order_id: result.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify Payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: "BOOKING",
                metadata: { bookingId: result.bookingId }
              }),
            });
            
            if (verifyRes.ok) {
              setBookingResult({
                bookingId: result.bookingId!,
                meetingLink: "Pending Mentor Approval",
                date: selectedDate,
                time: selectedSlot,
              });
              setStep(4);
            } else {
              const verifyData = await verifyRes.json();
              alert("Payment verification failed: " + verifyData.error);
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong while booking the session.");
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
                {/* Step 0: Service Selection */}
                {step === 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-1">Select a Service</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose the type of session you'd like to book
                    </p>
                    
                    <div className="space-y-4">
                      {mentor.services.map(service => (
                        <div 
                          key={service.id}
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            setStep(1);
                          }}
                          className={cn(
                            "p-5 rounded-2xl border cursor-pointer transition-all hover:border-primary hover:shadow-md",
                            selectedServiceId === service.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{service.title}</h3>
                            <span className="text-xl font-extrabold text-primary">₹{service.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground gap-3">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {service.duration} min session</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Video className="w-4 h-4"/> 1:1 Video Call</span>
                          </div>
                        </div>
                      ))}
                      {mentor.services.length === 0 && (
                        <div className="text-center p-8 bg-muted/30 rounded-2xl border border-dashed">
                          <p className="text-muted-foreground">No services configured yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 1: Calendar */}
                {step === 1 && selectedService && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold mb-1">Pick a Date</h2>
                      <Button variant="ghost" size="sm" onClick={() => { setStep(0); setSelectedServiceId(null); setSelectedDate(null); setSelectedSlot(null); }} className="text-xs">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Change Service
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Green dates have available time slots
                    </p>

                    {hasError ? (
                      <div className="text-center py-16 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/50">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Unable to load mentor availability.</h3>
                        <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-6">
                          Please try again later.
                        </p>
                        <Button onClick={() => fetchAvailableDates()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100">
                          Retry
                        </Button>
                      </div>
                    ) : isPending && availableDates.length === 0 ? (
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

                {/* Step 2: Time Slots */}
                {step === 2 && selectedDate && selectedService && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold">Pick a Time</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep(1);
                          setSelectedSlot(null);
                        }}
                        className="text-xs"
                      >
                        <ChevronLeft className="w-3 h-3 mr-1" /> Change Date
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {selectedService.duration} min sessions with{" "}
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

                {/* Step 3: Payment Confirmation */}
                {step === 3 && selectedDate && selectedSlot && selectedService && (
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
                          {selectedService.duration} Minutes
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Session Type
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Video className="w-4 h-4 text-primary" /> {selectedService.title}
                        </div>
                      </div>
                      <div className="border-t border-border" />
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold">
                          Total Amount
                        </span>
                        <span className="text-2xl font-extrabold text-primary">
                          ₹{selectedService.price.toLocaleString()}
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
                            Pay ₹{selectedService.price.toLocaleString()} via Razorpay
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setStep(2)}
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

                {/* Step 4: Success */}
                {step === 4 && bookingResult && (
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
                          {selectedService?.duration || 0} Minutes
                        </span>
                      </div>
                      <div className="border-t border-border/40" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Amount Paid
                        </span>
                        <span className="font-bold text-emerald-600">
                          ₹{(selectedService?.price || 0).toLocaleString()}
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
                          {selectedService?.duration || 0} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price
                        </span>
                        <span className="text-lg font-extrabold text-primary">
                          ₹{(selectedService?.price || 0).toLocaleString()}
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
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        callbackUrl={`/mentors/${mentorId}/book`}
      />
    </div>
  );
}
