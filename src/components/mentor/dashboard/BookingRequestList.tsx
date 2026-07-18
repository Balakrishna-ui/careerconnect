"use client";

import { useState } from "react";
import { BookingRequestCard } from "./BookingRequestCard";
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
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon, Check, X } from "lucide-react";

export function BookingRequestList({ bookings }: { bookings: any[] }) {
  const [activeAction, setActiveAction] = useState<{ id: string, type: "ACCEPT" | "REJECT", name: string } | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingInstructions, setMeetingInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!activeAction) return;
    
    setIsLoading(true);
    let res;
    
    if (activeAction.type === "ACCEPT") {
      if (!meetingLink) {
        setIsLoading(false);
        return;
      }
      res = await acceptBooking(activeAction.id, meetingLink, meetingInstructions);
    } else {
      res = await rejectBooking(activeAction.id);
    }
    
    setIsLoading(false);
    
    if (res.success) {
      setActiveAction(null);
      setMeetingLink("");
      setMeetingInstructions("");
    } else {
      alert(res.error || `Failed to ${activeAction.type.toLowerCase()} booking`);
    }
  };

  if (bookings.length === 0) {
    return <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-dashed border-border text-center">No pending requests at the moment.</div>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingRequestCard
          key={booking.id}
          id={booking.id}
          patientName={booking.user.name}
          patientImage={booking.user.image}
          serviceTitle="1:1 Mentorship Session"
          dateStr={booking.date.toLocaleDateString()}
          timeStr={booking.startTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit', hour12: true })}
          duration={Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / 60000)}
          price={booking.price}
          goal={booking.goal}
          experience={booking.experience}
          message={booking.message}
          resumeUrl={booking.resumeUrl}
          onAccept={(id) => setActiveAction({ id, type: "ACCEPT", name: booking.user.name })}
          onReject={(id) => setActiveAction({ id, type: "REJECT", name: booking.user.name })}
          isPending={isLoading && activeAction?.id === booking.id}
        />
      ))}

      {/* Accept Dialog */}
      <Dialog open={activeAction?.type === "ACCEPT"} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accept Session with {activeAction?.name}</DialogTitle>
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
            <div className="space-y-2 mt-4">
              <Label htmlFor="instructions">Pre-session Instructions (Optional)</Label>
              <Input
                id="instructions"
                placeholder="Please review these notes before we meet..."
                value={meetingInstructions}
                onChange={(e) => setMeetingInstructions(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={!meetingLink || isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirm & Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={activeAction?.type === "REJECT"} onOpenChange={(open) => !open && setActiveAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this session with {activeAction?.name}? This action cannot be undone, and the mentee will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleAction} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
