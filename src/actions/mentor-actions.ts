"use server";

import { prisma } from "@/lib/prisma";

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
    prisma.mentor.groupBy({ by: ["company"], where: baseWhere, _count: { _all: true }, orderBy: { _count: { company: "desc" } }, take: 20 }),
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
