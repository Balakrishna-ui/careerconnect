"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ContactMentorDialogProps {
  bookingId: string;
  mentorName: string;
  mentorRole: string | null;
  mentorCompany: string | null;
  mentorImage: string | null;
  sessionDate: Date;
  sessionTime: string;
}

export function ContactMentorDialog({
  bookingId,
  mentorName,
  mentorRole,
  mentorCompany,
  mentorImage,
  sessionDate,
  sessionTime,
}: ContactMentorDialogProps) {
  const [open, setOpen] = useState(false);

  const formattedBookingId = `BK-${bookingId.slice(-8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="h-4 w-4 mr-2" /> Contact Mentor
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Mentor</DialogTitle>
          <DialogDescription>
            Reach out to your mentor for questions or clarifications.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border mt-2">
          <Avatar className="h-20 w-20 mb-4 border shadow-sm">
            <AvatarImage src={mentorImage || ""} alt={mentorName} />
            <AvatarFallback>{mentorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{mentorName}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {mentorRole} {mentorCompany ? `at ${mentorCompany}` : ""}
          </p>

          <div className="w-full space-y-2 text-sm bg-background p-3 rounded border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Date:</span>
              <span className="font-medium">{format(new Date(sessionDate), "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{sessionTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID:</span>
              <span className="font-mono text-xs">{formattedBookingId}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 py-4">
          <Button className="w-full" onClick={() => toast.info("In-app messaging will be available soon.")}>
            <MessageSquare className="h-4 w-4 mr-2" /> Send Message
          </Button>

          <Link 
            href={`/mentor/${mentorName.toLowerCase().replace(/ /g, '-')}`}
            className={buttonVariants({ variant: "ghost", className: "w-full text-muted-foreground" })}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> View Mentor Profile
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
