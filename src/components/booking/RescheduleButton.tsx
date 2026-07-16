"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RescheduleModal } from "./RescheduleModal";
import { useRouter } from "next/navigation";

interface RescheduleButtonProps {
  bookingId: string;
  mentorId: string;
  currentDate: Date;
  disabled?: boolean;
}

export function RescheduleButton({ bookingId, mentorId, currentDate, disabled }: RescheduleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs" 
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        Reschedule
      </Button>

      {isOpen && (
        <RescheduleModal
          bookingId={bookingId}
          mentorId={mentorId}
          currentDate={currentDate}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            alert("Reschedule request submitted successfully! Your mentor has been notified.");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
