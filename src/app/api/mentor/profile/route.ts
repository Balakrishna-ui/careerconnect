import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
      include: {
        experiences: true,
        educations: true,
        skills: true,
        socialProfiles: true,
      },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor profile not found" }, { status: 404 });
    }

    return NextResponse.json({ mentor }, { status: 200 });
  } catch (error) {
    console.error("Fetch mentor profile error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Since we're doing a flat update for Personal and Professional Info, we extract the fields
    const updatedMentor = await prisma.mentor.update({
      where: { userId: session.user.id },
      data: {
        name: data.name,
        company: data.company,
        role: data.role,
        industry: data.industry,
        experienceYears: data.experienceYears,
        location: data.location,
        languages: data.languages,
        headline: data.headline,
        bio: data.bio,
        highlights: data.highlights,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : undefined,
        country: data.country,
        state: data.state,
        city: data.city,
        timezone: data.timezone,
        employmentType: data.employmentType,
        careerLevel: data.careerLevel,
        currentCTC: data.currentCTC,
        noticePeriod: data.noticePeriod,
      },
    });

    // Also handle SocialProfiles if provided
    if (data.socialProfiles) {
      await prisma.socialProfile.upsert({
        where: { mentorId: updatedMentor.id },
        update: {
          linkedin: data.socialProfiles.linkedin || "",
          portfolio: data.socialProfiles.portfolio,
          github: data.socialProfiles.github,
          twitter: data.socialProfiles.twitter,
          youtube: data.socialProfiles.youtube,
        },
        create: {
          mentorId: updatedMentor.id,
          linkedin: data.socialProfiles.linkedin || "",
          portfolio: data.socialProfiles.portfolio,
          github: data.socialProfiles.github,
          twitter: data.socialProfiles.twitter,
          youtube: data.socialProfiles.youtube,
        },
      });
    }

    // Handle Skills if provided
    if (data.technicalSkills !== undefined || data.nonTechnicalSkills !== undefined || data.areasOfMentorship !== undefined) {
      // First delete all existing skills for this mentor
      await prisma.skill.deleteMany({
        where: { mentorId: updatedMentor.id },
      });

      // Then recreate them
      const skillsToCreate = [
        ...(data.technicalSkills || []).map((s: string) => ({ name: s, category: "Technical", mentorId: updatedMentor.id })),
        ...(data.nonTechnicalSkills || []).map((s: string) => ({ name: s, category: "Non-Technical", mentorId: updatedMentor.id })),
        ...(data.areasOfMentorship || []).map((s: string) => ({ name: s, category: "Areas of Mentorship", mentorId: updatedMentor.id }))
      ];

      if (skillsToCreate.length > 0) {
        await prisma.skill.createMany({
          data: skillsToCreate,
        });
      }
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Profile updated successfully", mentor: updatedMentor }, { status: 200 });
  } catch (error) {
    console.error("Update mentor profile error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile" },
      { status: 500 }
    );
  }
}
