import { Suspense } from "react";
import MentorsContent from "@/components/mentors/MentorsContent";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Find a Mentor | CareerConnect",
  description: "Discover verified mentors from top companies. Filter by company, skills, experience, price, and career goals.",
};

export default function MentorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MentorsContent />
    </Suspense>
  );
}
