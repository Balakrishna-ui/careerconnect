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
        projects: true,
        certifications: true,
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
    
    // Clean up undefined values from data to avoid overwriting with null
    const updateData: any = {};
    const fieldsToUpdate = [
      'name', 'company', 'role', 'industry', 'experienceYears', 'location', 
      'languages', 'headline', 'bio', 'highlights', 'gender', 'dob', 'country', 
      'state', 'city', 'timezone', 'employmentType', 'careerLevel', 'currentCTC', 
      'noticePeriod', 'coverImage', 'resumeUrl', 'vacationMode', 'image'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = field === 'dob' && data[field] ? new Date(data[field]) : data[field];
      }
    });

    const updatedMentor = await prisma.mentor.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    const userUpdateData: any = {};
    if (data.mobile !== undefined) userUpdateData.mobile = data.mobile;
    if (data.image !== undefined) userUpdateData.image = data.image;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData
      });
      // Attach to returned object for frontend convenience
      (updatedMentor as any).user = { ...((updatedMentor as any).user || {}), ...userUpdateData };
    }

    // Handle SocialProfiles
    if (data.socialProfiles) {
      const sp = data.socialProfiles;
      await prisma.socialProfile.upsert({
        where: { mentorId: updatedMentor.id },
        update: {
          linkedin: sp.linkedin || "",
          portfolio: sp.portfolio,
          github: sp.github,
          twitter: sp.twitter,
          youtube: sp.youtube,
          website: sp.website,
          leetcode: sp.leetcode,
          codechef: sp.codechef,
          hackerrank: sp.hackerrank,
          behance: sp.behance,
          dribbble: sp.dribbble,
        },
        create: {
          mentorId: updatedMentor.id,
          linkedin: sp.linkedin || "",
          portfolio: sp.portfolio,
          github: sp.github,
          twitter: sp.twitter,
          youtube: sp.youtube,
          website: sp.website,
          leetcode: sp.leetcode,
          codechef: sp.codechef,
          hackerrank: sp.hackerrank,
          behance: sp.behance,
          dribbble: sp.dribbble,
        },
      });
    }

    // Handle Skills
    if (data.technicalSkills !== undefined || data.nonTechnicalSkills !== undefined || data.areasOfMentorship !== undefined) {
      await prisma.skill.deleteMany({ where: { mentorId: updatedMentor.id } });
      const skillsToCreate = [
        ...(data.technicalSkills || []).map((s: string) => ({ name: s, category: "Technical", mentorId: updatedMentor.id })),
        ...(data.nonTechnicalSkills || []).map((s: string) => ({ name: s, category: "Non-Technical", mentorId: updatedMentor.id })),
        ...(data.areasOfMentorship || []).map((s: string) => ({ name: s, category: "Areas of Mentorship", mentorId: updatedMentor.id }))
      ];
      if (skillsToCreate.length > 0) {
        await prisma.skill.createMany({ data: skillsToCreate });
      }
    }

    // Handle Projects
    if (data.projects) {
      await prisma.project.deleteMany({ where: { mentorId: updatedMentor.id } });
      if (data.projects.length > 0) {
        await prisma.project.createMany({
          data: data.projects.map((p: any) => ({
            mentorId: updatedMentor.id,
            title: p.title,
            description: p.description,
            githubUrl: p.githubUrl,
            demoUrl: p.demoUrl,
            technologies: p.technologies
          }))
        });
      }
    }

    // Handle Certifications
    if (data.certifications) {
      await prisma.certification.deleteMany({ where: { mentorId: updatedMentor.id } });
      if (data.certifications.length > 0) {
        await prisma.certification.createMany({
          data: data.certifications.map((c: any) => ({
            mentorId: updatedMentor.id,
            name: c.name,
            issuer: c.issuer,
            year: c.year,
            url: c.url
          }))
        });
      }
    }

    // Handle Experiences
    if (data.experiences) {
      await prisma.experience.deleteMany({ where: { mentorId: updatedMentor.id } });
      if (data.experiences.length > 0) {
        await prisma.experience.createMany({
          data: data.experiences.map((e: any) => ({
            mentorId: updatedMentor.id,
            companyName: e.companyName,
            designation: e.designation,
            duration: e.duration,
            domain: e.domain,
            responsibilities: e.responsibilities
          }))
        });
      }
    }

    // Handle Educations
    if (data.educations) {
      await prisma.education.deleteMany({ where: { mentorId: updatedMentor.id } });
      if (data.educations.length > 0) {
        await prisma.education.createMany({
          data: data.educations.map((e: any) => ({
            mentorId: updatedMentor.id,
            college: e.college,
            degree: e.degree,
            passingYear: e.passingYear,
            cgpa: e.cgpa
          }))
        });
      }
    }

    revalidatePath("/", "layout");

    const fullyUpdatedMentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        experiences: true,
        educations: true,
        skills: true,
        socialProfiles: true,
        projects: true,
        certifications: true,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", mentor: fullyUpdatedMentor }, { status: 200 });
  } catch (error) {
    console.error("Update mentor profile error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile" },
      { status: 500 }
    );
  }
}
