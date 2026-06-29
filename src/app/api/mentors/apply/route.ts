import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/mentors/apply — Submit or draft a mentor application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Account
      firstName, lastName, email, mobile, password,
      // Personal
      gender, dob, country, state, city, timezone,
      // Professional
      designation, company, employmentType, totalExperience, industry, careerLevel,
      // Expertise
      technicalSkills = [], nonTechnicalSkills = [], mentorshipAreas = [],
      // About
      bio, highlights,
      // Sessions
      sessions = [],
      // Schedule
      schedule = [],
      // Social
      linkedin, portfolio, github, twitter, youtube,
      // Action
      action = "SUBMIT" // SUBMIT or DRAFT
    } = body;

    // Create or find user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          mobile: mobile || null,
          password: password || null,
          role: "MENTOR",
        },
      });
    }

    // Check if mentor profile already exists
    let mentor = await prisma.mentor.findUnique({ where: { userId: user.id } });

    const allSkills = [
      ...technicalSkills.map((s: string) => ({ name: s, category: "Technical" })),
      ...nonTechnicalSkills.map((s: string) => ({ name: s, category: "Non-Technical" })),
      ...mentorshipAreas.map((s: string) => ({ name: s, category: "Areas of Mentorship" })),
    ];

    const completionScore = calculateCompletionScore(body);
    const applicationStatus = action === "SUBMIT" ? "PENDING" : "DRAFT";

    if (mentor) {
      // Update existing profile
      await prisma.skill.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.sessionType.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.weeklySchedule.deleteMany({ where: { mentorId: mentor.id } });

      mentor = await prisma.mentor.update({
        where: { id: mentor.id },
        data: {
          name: `${firstName} ${lastName}`,
          role: designation || null,
          company: company || null,
          industry: industry || null,
          experienceYears: totalExperience ? parseInt(totalExperience) : null,
          gender: gender || null,
          dob: dob ? new Date(dob) : null,
          country: country || null,
          state: state || null,
          city: city || null,
          timezone: timezone || null,
          employmentType: employmentType || null,
          careerLevel: careerLevel || null,
          bio: bio || null,
          highlights: highlights || null,
          completionScore,
          profileCompleted: completionScore >= 80,
          applicationStatus,
          price: sessions.length > 0 ? parseInt(sessions[0].price) || 0 : 0,
          skills: { create: allSkills },
          sessionTypes: {
            create: sessions.map((s: { type: string; duration: number; price: string }) => ({
              title: s.type,
              duration: s.duration,
              price: parseInt(s.price) || 0,
            })),
          },
          weeklySchedules: {
            create: schedule
              .filter((d: { isAvailable: boolean }) => d.isAvailable)
              .map((d: { dayOfWeek: number; startTime: string; endTime: string }) => ({
                dayOfWeek: d.dayOfWeek,
                startTime: d.startTime,
                endTime: d.endTime,
                isAvailable: true,
              })),
          },
        },
      });

      // Update social profiles
      if (linkedin) {
        await prisma.socialProfile.upsert({
          where: { mentorId: mentor.id },
          update: { linkedin, portfolio, github, twitter, youtube },
          create: { mentorId: mentor.id, linkedin, portfolio, github, twitter, youtube },
        });
      }
    } else {
      // Create new mentor profile
      mentor = await prisma.mentor.create({
        data: {
          userId: user.id,
          name: `${firstName} ${lastName}`,
          role: designation || null,
          company: company || null,
          industry: industry || null,
          experienceYears: totalExperience ? parseInt(totalExperience) : null,
          gender: gender || null,
          dob: dob ? new Date(dob) : null,
          country: country || null,
          state: state || null,
          city: city || null,
          timezone: timezone || null,
          employmentType: employmentType || null,
          careerLevel: careerLevel || null,
          bio: bio || null,
          highlights: highlights || null,
          completionScore,
          profileCompleted: completionScore >= 80,
          applicationStatus,
          price: sessions.length > 0 ? parseInt(sessions[0].price) || 0 : 0,
          skills: { create: allSkills },
          sessionTypes: {
            create: sessions.map((s: { type: string; duration: number; price: string }) => ({
              title: s.type,
              duration: s.duration,
              price: parseInt(s.price) || 0,
            })),
          },
          weeklySchedules: {
            create: schedule
              .filter((d: { isAvailable: boolean }) => d.isAvailable)
              .map((d: { dayOfWeek: number; startTime: string; endTime: string }) => ({
                dayOfWeek: d.dayOfWeek,
                startTime: d.startTime,
                endTime: d.endTime,
                isAvailable: true,
              })),
          },
          socialProfiles: linkedin
            ? { create: { linkedin, portfolio, github, twitter, youtube } }
            : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, mentorId: mentor.id, status: applicationStatus });
  } catch (error) {
    console.error("Mentor application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

function calculateCompletionScore(data: Record<string, unknown>): number {
  let score = 0;
  // Account (10%)
  if (data.firstName && data.lastName && data.email) score += 10;
  // Personal (10%)
  if (data.gender && data.dob && data.country) score += 10;
  // Professional (15%)
  if (data.designation && data.company && data.industry) score += 15;
  // Skills (15%)
  const totalSkills = ((data.technicalSkills as string[]) || []).length + ((data.nonTechnicalSkills as string[]) || []).length + ((data.mentorshipAreas as string[]) || []).length;
  if (totalSkills >= 3) score += 15;
  // Bio (10%)
  if (data.bio && (data.bio as string).length >= 300) score += 10;
  // Sessions (15%)
  if (((data.sessions as unknown[]) || []).length > 0) score += 15;
  // Schedule (10%)
  if (((data.schedule as { isAvailable: boolean }[]) || []).some((d) => d.isAvailable)) score += 10;
  // Social (5%)
  if (data.linkedin) score += 5;
  // Docs (10%)
  if (data.hasDocuments) score += 10;
  return score;
}
