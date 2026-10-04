import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function MentorReviewsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  const rating = mentor.rating || 0;
  const reviewsCount = mentor.reviewsCount || 0;
  const reviews = mentor.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mentee Reviews</h2>
        <p className="text-muted-foreground">See what your mentees are saying about you.</p>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="flex flex-col items-center justify-center bg-card p-6 rounded-xl border shadow-sm min-w-[200px]">
          <div className="text-5xl font-bold mb-2">{rating.toFixed(1)}</div>
          <div className="flex text-amber-400 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  rating >= i
                    ? "fill-amber-400 stroke-amber-400"
                    : rating >= i - 0.5
                    ? "fill-amber-400/50 stroke-amber-400"
                    : "fill-muted stroke-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{reviewsCount} total {reviewsCount === 1 ? 'review' : 'reviews'}</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>All feedback from completed sessions.</CardDescription>
        </CardHeader>
        <CardContent className="border-t border-border/50 pt-6">
          {reviews.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary/30 flex items-center justify-center font-bold text-secondary-foreground text-sm overflow-hidden border">
                    {review.user?.image ? (
                      <img src={review.user.image} alt={review.user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      (review.user?.name || "U").substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{review.user?.name || "Anonymous User"}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            review.rating >= i ? "fill-amber-400 stroke-amber-400" : "fill-muted stroke-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
