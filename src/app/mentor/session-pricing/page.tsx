import { MentorSessionsForm } from "@/components/mentor/MentorSessionsForm";

export default function MentorSessionPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Session Types & Pricing</h2>
        <p className="text-muted-foreground">
          Create and manage the mentoring sessions you offer to mentees.
        </p>
      </div>
      <MentorSessionsForm />
    </div>
  );
}
