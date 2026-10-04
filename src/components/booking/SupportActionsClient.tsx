"use client";

import { ContactMentorDialog } from "./ContactMentorDialog";
import { ReportIssueDialog } from "./ReportIssueDialog";

interface SupportActionsClientProps {
  bookingId: string;
  mentorName: string;
  mentorRole: string | null;
  mentorCompany: string | null;
  mentorImage: string | null;
  mentorEmail?: string;
  sessionDate: Date;
  sessionTime: string;
}

export function SupportActionsClient({
  bookingId,
  mentorName,
  mentorRole,
  mentorCompany,
  mentorImage,
  mentorEmail,
  sessionDate,
  sessionTime,
}: SupportActionsClientProps) {
  return (
    <>
      <ContactMentorDialog 
        bookingId={bookingId}
        mentorName={mentorName}
        mentorRole={mentorRole}
        mentorCompany={mentorCompany}
        mentorImage={mentorImage}
        sessionDate={sessionDate}
        sessionTime={sessionTime}
      />
      
      <ReportIssueDialog 
        bookingId={bookingId}
        mentorName={mentorName}
        sessionDate={sessionDate}
      />
    </>
  );
}
