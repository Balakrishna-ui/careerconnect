"use client";

import { useState, useEffect } from "react";
import { getMentorBookings } from "@/actions/admin-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { format } from "date-fns";

interface AdminMentorSessionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string | null;
  mentorName: string;
}

export function AdminMentorSessionsDialog({
  isOpen,
  onClose,
  mentorId,
  mentorName
}: AdminMentorSessionsDialogProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mentorId) {
      setIsLoading(true);
      getMentorBookings(mentorId)
        .then((data) => setSessions(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setSessions([]);
    }
  }, [isOpen, mentorId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mentorName}'s Sessions</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions found for this mentor.
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Mentee</th>
                  <th className="px-6 py-3 font-medium">Date & Time</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((session) => {
                  const isPast = new Date(session.startTime) < new Date();
                  let displayStatus = session.status.toLowerCase();
                  if (isPast && session.status !== "COMPLETED" && session.status !== "CANCELLED") {
                    displayStatus = "pending";
                  }

                  return (
                    <tr key={session.id} className="bg-card hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{session.user.name || "Unknown User"}</div>
                        <div className="text-xs text-muted-foreground">{session.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{format(new Date(session.date), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${session.price || session.payment?.amount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={session.payment?.status?.toLowerCase() || "pending"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
