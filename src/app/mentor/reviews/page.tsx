import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function MentorReviewsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mentee Reviews</h2>
        <p className="text-muted-foreground">See what your mentees are saying about you.</p>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="flex flex-col items-center justify-center bg-card p-6 rounded-xl border shadow-sm min-w-[200px]">
          <div className="text-5xl font-bold mb-2">0.0</div>
          <div className="flex text-amber-400 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-muted stroke-muted" />)}
          </div>
          <p className="text-sm text-muted-foreground">0 total reviews</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>All feedback from completed sessions.</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center border-t border-border/50">
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
