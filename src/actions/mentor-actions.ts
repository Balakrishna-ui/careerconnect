"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface MentorFilters {
  search?: string;
  experience?: string[];       // e.g. ["0-2", "5-8"]
  companies?: string[];
  roles?: string[];
  skills?: string[];
  industries?: string[];
  goals?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  companyTiers?: string[];
  verified?: boolean;
  languages?: string[];
  locations?: string[];
  remoteAvailable?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

function expRangeToMinMax(range: string): { min: number; max: number } {
  switch (range) {
    case "0-2":  return { min: 0, max: 2 };
    case "2-5":  return { min: 2, max: 5 };
    case "5-8":  return { min: 5, max: 8 };
    case "8-12": return { min: 8, max: 12 };
    case "12+":  return { min: 12, max: 99 };
    default:     return { min: 0, max: 99 };
  }
}

export async function getMentors(filters: MentorFilters = {}) {
  const {
    search,
    experience = [],
    companies = [],
    roles = [],
    skills = [],
    industries = [],
    goals = [],
    minPrice,
    maxPrice,
    minRating,
    companyTiers = [],
    verified,
    languages = [],
    locations = [],
    remoteAvailable,
    sortBy = "relevant",
    page = 1,
    limit = 12,
  } = filters;

  // Build experience condition
  let expConditions: { experienceYears: { gte: number; lte: number } }[] = [];
  if (experience.length > 0) {
    expConditions = experience.map((range) => {
      const { min, max } = expRangeToMinMax(range);
      return { experienceYears: { gte: min, lte: max } };
    });
  }

  const where: Record<string, unknown> = {
    AND: [
      // *** Only show VERIFIED mentors publicly ***
      { applicationStatus: "VERIFIED" },
      { profileCompleted: true },

      // Text search
      search
        ? {
            OR: [
              { name: { contains: search } },
              { role: { contains: search } },
              { company: { contains: search } },
              { industry: { contains: search } },
              { skills: { some: { name: { contains: search } } } },
            ],
          }
        : {},

      // Experience ranges (OR across selected)
      expConditions.length > 0 ? { OR: expConditions } : {},

      // Company filter
      companies.length > 0 ? { company: { in: companies } } : {},

      // Role filter
      roles.length > 0 ? { OR: roles.map((r) => ({ role: { contains: r } })) } : {},

      // Skills filter (mentor must have ANY selected skill — use relational query)
      skills.length > 0 ? { OR: skills.map((skill) => ({ skills: { some: { name: { contains: skill } } } })) } : {},

      // Industry filter
      industries.length > 0 ? { industry: { in: industries } } : {},

      // Goals filter (now mapped to session types or skills with "Areas of Mentorship" category)
      goals.length > 0 ? { OR: goals.map((goal) => ({ skills: { some: { name: { contains: goal }, category: "Areas of Mentorship" } } })) } : {},

      // Price range
      minPrice != null ? { price: { gte: minPrice } } : {},
      maxPrice != null ? { price: { lte: maxPrice } } : {},

      // Rating
      minRating != null ? { rating: { gte: minRating } } : {},

      // Company tier
      companyTiers.length > 0 ? { companyTier: { in: companyTiers } } : {},

      // Languages
      languages.length > 0
        ? { OR: languages.map((l) => ({ languages: { contains: l } })) }
        : {},

      // Location
      locations.length > 0 ? { location: { in: locations } } : {},

      // Remote
      remoteAvailable === true ? { remoteAvailable: true } : {},
    ],
  };

  // Sort ordering
  let orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "highest-rated":   orderBy = { rating: "desc" }; break;
    case "most-booked":     orderBy = { totalSessions: "desc" }; break;
    case "price-low":       orderBy = { price: "asc" }; break;
    case "price-high":      orderBy = { price: "desc" }; break;
    case "most-experienced": orderBy = { experienceYears: "desc" }; break;
    case "recently-joined": orderBy = { createdAt: "desc" }; break;
    default:                orderBy = { reviewsCount: "desc" }; // Most Relevant
  }

  const skip = (page - 1) * limit;

  const [mentorsRaw, total] = await Promise.all([
    prisma.mentor.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        skills: true,
      },
    }),
    prisma.mentor.count({ where }),
  ]);

  // Map to backward-compatible shape for MentorResultCard
  const mentors = mentorsRaw.map((m) => {
    // Sort skills so selected/searched skills appear first
    const sortedSkills = [...m.skills].sort((a, b) => {
      const aMatch = skills.some(s => a.name.includes(s)) || (search && a.name.toLowerCase().includes(search.toLowerCase()));
      const bMatch = skills.some(s => b.name.includes(s)) || (search && b.name.toLowerCase().includes(search.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    return {
      id: m.id,
      name: m.name,
      role: m.role ?? "",
      company: m.company ?? "",
      companyTier: m.companyTier,
      industry: m.industry ?? "",
      experienceYears: m.experienceYears ?? 0,
      rating: m.rating,
      reviewsCount: m.reviewsCount,
      price: m.price,
      verified: m.applicationStatus === "VERIFIED",
      image: m.image,
      location: m.location ?? "",
      languages: m.languages ?? "",
      remoteAvailable: m.remoteAvailable,
      nextAvailable: m.nextAvailable,
      totalSessions: m.totalSessions,
      skills: sortedSkills.map((s) => s.name).join(", "),
      goals: m.skills.filter((s) => s.category === "Areas of Mentorship").map((s) => s.name).join(", "),
    };
  });

  return { mentors: JSON.parse(JSON.stringify(mentors)), total, page, limit };
}

export async function getFilterCounts() {
  // Only count verified mentors for filters
  const baseWhere = { applicationStatus: "VERIFIED", profileCompleted: true };

  const [
    companyCounts,
    industryCounts,
    tierCounts,
    locationCounts,
    totalVerified,
  ] = await Promise.all([
    prisma.mentor.groupBy({ by: ["company"], where: baseWhere, _count: { _all: true, company: true }, orderBy: { _count: { company: "desc" } }, take: 20 }),
    prisma.mentor.groupBy({ by: ["industry"], where: baseWhere, _count: { _all: true } }),
    prisma.mentor.groupBy({ by: ["companyTier"], where: baseWhere, _count: { _all: true } }),
    prisma.mentor.groupBy({ by: ["location"], where: baseWhere, _count: { _all: true } }),
    prisma.mentor.count({ where: baseWhere }),
  ]);

  return {
    companies: companyCounts.map((c) => ({ name: c.company ?? "", count: c._count._all })),
    industries: industryCounts.map((i) => ({ name: i.industry ?? "", count: i._count._all })),
    tiers: tierCounts.map((t) => ({ name: t.companyTier, count: t._count._all })),
    locations: locationCounts.map((l) => ({ name: l.location ?? "", count: l._count._all })),
    totalVerified,
  };
}

export async function getSkillSuggestions(query: string) {
  const ALL_SKILLS = [
    "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
    "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
    "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
    "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
    "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
    "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
    "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain",
    "Leadership", "Negotiation", "Career Growth", "Mock Interview", "Resume Review"
  ];
  return ALL_SKILLS.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
}

export async function resubmitMentorApplication() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const mentor = await prisma.mentor.findUnique({ where: { userId: session.user.id } });
  if (!mentor) return { success: false, error: "Mentor profile not found" };

  await prisma.mentor.update({
    where: { id: mentor.id },
    data: {
      applicationStatus: "PENDING",
      profileCompleted: true
    }
  });

  return { success: true };
}

export async function getMentorDraft() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  const mentor = await prisma.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      documents: true,
      skills: true,
      experiences: true,
      educations: true,
      socialProfiles: true,
      sessionTypes: true,
      adminReviews: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!mentor || !["DRAFT", "PENDING", "REJECTED", "MORE_INFO_REQUIRED", "UNDER_REVIEW"].includes(mentor.applicationStatus)) {
    return { success: false };
  }

  return { success: true, mentor };
}

export async function saveMentorDraft(step: number, data: any) {
  if (step === 1) {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    let user = await prisma.user.findFirst({ where: { email: data.email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          role: "MENTOR",
          password: hashedPassword
        }
      });
    } else if (hashedPassword) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "MENTOR", password: user.password ? user.password : hashedPassword }
      });
    }

    let mentor = await prisma.mentor.findUnique({ where: { userId: user.id } });
    if (!mentor) {
      mentor = await prisma.mentor.create({
        data: {
          userId: user.id,
          name: `${data.firstName} ${data.lastName}`,
          applicationStatus: "DRAFT",
          profileCompleted: false,
        }
      });
    } else {
      await prisma.mentor.update({
        where: { id: mentor.id },
        data: { name: `${data.firstName} ${data.lastName}` }
      });
    }
    return { success: true, user: { email: data.email, password: data.password } };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const mentor = await prisma.mentor.findUnique({ where: { userId: session.user.id } });
  if (!mentor) return { success: false, error: "Mentor profile not found" };

  if (step === 2) {
    // Identity Verification (Documents & Social Profiles)
    const docs = [];
    if (data.aadhaar && typeof data.aadhaar === 'string') docs.push({ type: "AADHAAR", fileUrl: data.aadhaar });
    if (data.panCard && typeof data.panCard === 'string') docs.push({ type: "PAN", fileUrl: data.panCard });
    if (data.resume && typeof data.resume === 'string') docs.push({ type: "RESUME", fileUrl: data.resume });
    if (data.profilePhoto && typeof data.profilePhoto === 'string') docs.push({ type: "PROFILE_PHOTO", fileUrl: data.profilePhoto });

    if (data.profilePhoto && typeof data.profilePhoto === 'string') {
      await prisma.mentor.update({
        where: { id: mentor.id },
        data: { image: data.profilePhoto }
      });
    }

    if (docs.length > 0) {
      await prisma.verificationDocument.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.verificationDocument.createMany({
        data: docs.map(d => ({ ...d, mentorId: mentor.id }))
      });
    }

    if (data.linkedin || data.github || data.portfolio) {
      await prisma.socialProfile.upsert({
        where: { mentorId: mentor.id },
        update: { linkedin: data.linkedin || "", github: data.github || "", portfolio: data.portfolio || "" },
        create: { mentorId: mentor.id, linkedin: data.linkedin || "", github: data.github || "", portfolio: data.portfolio || "" }
      });
    }
  }

  if (step === 3) {
    // Company Verification
    await prisma.mentor.update({
      where: { id: mentor.id },
      data: { company: data.companyName, industry: data.domain || "Technology" }
    });
  }

  if (step === 4) {
    // Experience & Skills
    await prisma.mentor.update({
      where: { id: mentor.id },
      data: {
        role: data.designation,
        experienceYears: parseInt(data.experienceYears) || 0,
        employmentType: data.employmentType,
        currentCTC: data.currentCTC,
        noticePeriod: data.noticePeriod,
      }
    });

    if (data.technicalSkills !== undefined || data.nonTechnicalSkills !== undefined || data.areasOfMentorship !== undefined) {
      await prisma.skill.deleteMany({ where: { mentorId: mentor.id } });
      const skillsToCreate = [
        ...(data.technicalSkills || []).map((s: string) => ({ name: s, category: "Technical", mentorId: mentor.id })),
        ...(data.nonTechnicalSkills || []).map((s: string) => ({ name: s, category: "Non-Technical", mentorId: mentor.id })),
        ...(data.areasOfMentorship || []).map((s: string) => ({ name: s, category: "Areas of Mentorship", mentorId: mentor.id }))
      ];
      if (skillsToCreate.length > 0) {
        await prisma.skill.createMany({ data: skillsToCreate });
      }
    }

    if (data.previousCompanies && data.previousCompanies.length > 0) {
      await prisma.experience.deleteMany({ where: { mentorId: mentor.id } });
      await prisma.experience.createMany({
        data: data.previousCompanies.map((exp: any) => ({
          mentorId: mentor.id,
          companyName: exp.company,
          designation: exp.role,
          duration: exp.duration,
          domain: exp.domain
        }))
      });
    }
  }

  if (step === 5) {
    // Profile Information
    await prisma.mentor.update({
      where: { id: mentor.id },
      data: {
        bio: data.bio,
        headline: data.headline,
        languages: data.languages,
        location: data.location,
        profileVisibility: data.profileVisibility || "PRIVATE",
      }
    });
    
    // Sessions
    if (data.sessions && Array.isArray(data.sessions)) {
      await prisma.sessionType.deleteMany({ where: { mentorId: mentor.id } });
      if (data.sessions.length > 0) {
        const sessionData = data.sessions.map((s: any) => ({
          mentorId: mentor.id,
          title: s.title || s.type,
          duration: parseInt(s.duration) || 30,
          price: parseInt(s.price) || 0
        }));
        await prisma.sessionType.createMany({ data: sessionData });

        const minPrice = Math.min(...sessionData.map((s: any) => s.price));
        await prisma.mentor.update({
          where: { id: mentor.id },
          data: { price: minPrice }
        });
      }
    }
    
    // Weekly Schedules default if not present
    const existingSchedules = await prisma.weeklySchedule.count({ where: { mentorId: mentor.id } });
    if (existingSchedules === 0) {
      await prisma.weeklySchedule.createMany({
        data: [1, 2, 3, 4, 5].map(day => ({
          mentorId: mentor.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true
        }))
      });
    }
  }

  return { success: true };
}

export async function submitMentorApplication(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const mentor = await prisma.mentor.findUnique({ where: { userId: session.user.id } });
  if (!mentor) return { success: false, error: "Mentor profile not found" };

  await prisma.mentor.update({
    where: { id: mentor.id },
    data: {
      applicationStatus: "PENDING",
      profileCompleted: true
    }
  });

  return { success: true, mentorId: mentor.id };
}
