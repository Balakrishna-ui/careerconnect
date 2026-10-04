"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getJobSeekerProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      experiences: { orderBy: { duration: 'desc' } }, // Simple ordering, we might need a better one
      educations: true,
      skills: true,
      projects: true,
      certifications: true,
      socialProfile: true,
    },
  });

  if (!user) {
    // If the user is somehow not found in the DB (e.g. wiped), redirect to login
    return null as any; 
  }

  return user;
}

export async function updateJobSeekerProfile(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Basic info update
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      headline: data.headline,
      bio: data.profileSummary || data.bio,
      location: data.location,
      city: data.city,
      state: data.state,
      country: data.country,
      dob: data.dob ? new Date(data.dob) : null,
      coverImage: data.coverImage,
      experienceYears: data.experienceLevel ? parseInt(data.experienceLevel) : (data.experienceYears ? parseInt(data.experienceYears) : null),
      industry: data.industry,
      
      jobTitle: data.designation || data.jobTitle,
      currentCompany: data.company || data.currentCompany,
      employmentType: data.employmentType,
      careerLevel: data.careerLevel,
      noticePeriod: data.noticePeriod,
      employmentStatus: data.employmentStatus,
      
      targetJobTitle: data.targetJobTitle,
      preferredJobRoles: data.preferredJobRoles,
      preferredIndustries: data.preferredIndustries,
      preferredLocations: data.preferredLocations,
      workPreferences: data.workPreferences,
      expectedSalaryRange: data.expectedSalaryRange,
      preferredEmploymentType: data.preferredEmploymentType,
      openToRelocation: data.openToRelocation,
      careerGoals: data.careerGoals,
      
      isFresher: data.isFresher === "true" || data.isFresher === true,
      targetDomains: data.targetDomains,
      specializations: data.specializations,
      currentSalary: data.currentSalary,
      expectedSalary: data.expectedSalary,
    },
  });

  if (data.skills) {
    await prisma.skill.deleteMany({ where: { userId: session.user.id } });
    const skillsArray = typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : data.skills;
    if (skillsArray.length > 0) {
      await prisma.skill.createMany({
        data: skillsArray.map((s: string) => ({ userId: session.user.id, name: s, category: "Technical" }))
      });
    }
  }

  if (data.experiences && data.experiences.length > 0) {
    await prisma.experience.deleteMany({ where: { userId: session.user.id } });
    await prisma.experience.createMany({
      data: data.experiences.map((exp: any) => ({
        userId: session.user.id,
        companyName: exp.companyName,
        designation: exp.jobTitle || exp.designation,
        duration: exp.duration,
        location: exp.location || ""
      }))
    });
  }

  if (data.educations && data.educations.length > 0) {
    await prisma.education.deleteMany({ where: { userId: session.user.id } });
    await prisma.education.createMany({
      data: data.educations.map((edu: any) => ({
        userId: session.user.id,
        degree: edu.degree,
        college: edu.college,
        passingYear: edu.passingYear,
        branch: edu.branch,
        collegeTier: edu.collegeTier,
        scoreType: edu.scoreType,
        cgpa: edu.cgpa,
        currentlyStudying: edu.currentlyStudying === true || edu.currentlyStudying === "true",
        tenthMarks: edu.tenthMarks,
        tenthYear: edu.tenthYear,
        twelfthMarks: edu.twelfthMarks,
        twelfthYear: edu.twelfthYear,
        diplomaBranch: edu.diplomaBranch,
        diplomaYear: edu.diplomaYear
      }))
    });
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/profile/edit");
  return { success: true, user: updatedUser };
}
