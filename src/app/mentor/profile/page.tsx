import { MentorProfileForm } from "@/components/mentor/MentorProfileForm";

export default function MentorProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Management</h2>
        <p className="text-muted-foreground">
          Update your public profile information and professional details.
        </p>
      </div>
      <MentorProfileForm />
    </div>
  );
}
