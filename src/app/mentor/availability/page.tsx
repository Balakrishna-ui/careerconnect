import { MentorAvailabilityForm } from "@/components/mentor/MentorAvailabilityForm";

export default function MentorAvailabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Availability & Schedule</h2>
        <p className="text-muted-foreground">
          Define your weekly working hours and block off unavailable dates.
        </p>
      </div>
      <MentorAvailabilityForm />
    </div>
  );
}
