import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SavedMentorsClient from "@/components/dashboard/SavedMentorsClient";

export const dynamic = "force-dynamic";

export default async function SavedMentorsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedMentors: {
        include: {
          mentor: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Pass the saved mentors directly to the client component
  const initialData = user.savedMentors.map(sm => ({
    id: sm.id,
    mentorId: sm.mentor.id,
    name: sm.mentor.name,
    company: sm.mentor.company || "Independent",
    role: sm.mentor.role || "Mentor",
    experienceYears: sm.mentor.experienceYears || 0,
    rating: sm.mentor.rating || 0.0,
    reviewsCount: sm.mentor.reviewsCount || 0,
    price: sm.mentor.price || 0,
    image: sm.mentor.image,
  }));

  return <SavedMentorsClient initialData={initialData} />;
}
