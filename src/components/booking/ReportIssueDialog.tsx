"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Paperclip, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReportIssueDialogProps {
  bookingId: string;
  mentorName: string;
  sessionDate: Date;
}

const ISSUE_CATEGORIES = [
  "Mentor didn't respond",
  "Meeting link not working",
  "Mentor didn't join",
  "Payment issue",
  "Technical issue",
  "Want to reschedule",
  "Other",
];

export function ReportIssueDialog({
  bookingId,
  mentorName,
  sessionDate,
}: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const router = useRouter();

  const formattedBookingId = `BK-${bookingId.slice(-8).toUpperCase()}`;

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Please select an issue category.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a description of the issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          category,
          description,
          // attachment is a stub for now
          attachment: null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await res.json();
      setTicketId(data.ticketId);
      setIsSuccess(true);
      toast.success("Issue reported successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state on close
      setTimeout(() => {
        setCategory("");
        setDescription("");
        setIsSuccess(false);
        setTicketId("");
      }, 300);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <AlertCircle className="h-4 w-4 mr-2" /> Report an issue
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl mb-2">Report Submitted Successfully</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Your issue has been reported and our support team will review it shortly. Expected response time is within 24 hours.
            </DialogDescription>
            
            <div className="bg-muted p-4 rounded-lg w-full mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground text-sm">Ticket Number:</span>
                <span className="font-mono text-sm font-semibold">{ticketId.slice(-10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Status:</span>
                <span className="text-sm font-semibold text-amber-600">Open</span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              {/* Note: /dashboard/support doesn't exist yet, but it's a good stub for "View My Reports" */}
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                View My Reports
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                We're sorry you're experiencing an issue. Please provide details below so we can help resolve it.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/30 p-3 rounded-md text-sm mb-4 border flex justify-between items-center">
              <div>
                <span className="text-muted-foreground">Booking ID: </span>
                <span className="font-mono font-medium">{formattedBookingId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mentor: </span>
                <span className="font-medium">{mentorName}</span>
              </div>
            </div>

            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="category">Issue Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Issue Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Please provide as much detail as possible about your issue..." 
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input id="attachment" type="file" className="cursor-pointer file:cursor-pointer" accept="image/*,.pdf" />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can upload screenshots, images, or PDFs to help us understand the issue. (Max 5MB)
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !category || !description.trim()}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
