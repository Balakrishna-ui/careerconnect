"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Link as LinkIcon } from "lucide-react";
import { acceptBooking, rejectBooking } from "@/actions/mentor-booking-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MentorBookingActionsProps {
  bookingId: string;
  patientName: string; // Used to refer to the mentee in the dialog
}

export function MentorBookingActions({ bookingId, patientName }: MentorBookingActionsProps) {
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");

  const handleAccept = async () => {
    if (!meetingLink) return;
    
    setIsLoading(true);
    const res = await acceptBooking(bookingId, meetingLink);
    setIsLoading(false);
    
    if (res.success) {
      setIsAcceptOpen(false);
    } else {
      alert(res.error || "Failed to accept booking");
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    const res = await rejectBooking(bookingId);
    setIsLoading(false);
    
    if (res.success) {
      setIsRejectOpen(false);
    } else {
      alert(res.error || "Failed to reject booking");
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => setIsRejectOpen(true)}
        >
          <X className="w-4 h-4" /> <span className="sr-only sm:not-sr-only sm:ml-1">Reject</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          onClick={() => setIsAcceptOpen(true)}
        >
          <Check className="w-4 h-4" /> <span className="sr-only sm:not-sr-only sm:ml-1">Accept</span>
        </Button>
      </div>

      {/* Accept Dialog */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accept Session with {patientName}</DialogTitle>
            <DialogDescription>
              Please provide a meeting link (Google Meet, Zoom, etc.) for this session. The mentee will use this link to join at the scheduled time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link">Meeting Link</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  placeholder="https://meet.google.com/..."
                  className="pl-9"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={!meetingLink || isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirm & Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this session with {patientName}? This action cannot be undone, and the mentee will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
