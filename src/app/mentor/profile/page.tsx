import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateProfileCompletion } from "@/lib/mentor-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Phone, Mail, Clock, FileText, Pencil, Plus, GraduationCap, CheckCircle2, Download, Trash2, Calendar, Target } from "lucide-react";

import { MentorProfileClient } from "@/components/mentor/MentorProfileClient";

export default async function MentorProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      experiences: true,
      skills: true,
      settings: true,
      sessionTypes: true,
      socialProfiles: true,
      documents: true,
      educations: true,
      projects: true,
      certifications: true,
      bookings: true,
      reviews: true,
    },
  });

  if (!mentor) {
    redirect("/signup?view=login");
  }

  const { score: completionPercent } = calculateProfileCompletion(mentor);

  return <MentorProfileClient mentor={mentor} completionPercent={completionPercent} />;
}
