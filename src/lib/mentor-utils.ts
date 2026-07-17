export function calculateProfileCompletion(mentor: any) {
  let score = 0;
  const missingFields: { label: string; href: string }[] = [];

  // Photo 10%
  if (mentor.user?.image) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Profile Picture", href: "/mentor/profile" });
  }

  // About 10%
  if (mentor.bio && mentor.bio.trim().length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add About Section", href: "/mentor/profile" });
  }

  // Headline 10%
  if (mentor.headline && mentor.headline.trim().length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Headline", href: "/mentor/profile" });
  }

  // Experience 10%
  if (mentor.experiences && mentor.experiences.length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Experience", href: "/mentor/profile" });
  }

  // Skills 20%
  if (mentor.skills && mentor.skills.length > 0) {
    score += 20;
  } else {
    missingFields.push({ label: "Add Skills", href: "/mentor/profile" });
  }

  // Company 10%
  if (mentor.company && mentor.company.trim().length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Current Company", href: "/mentor/profile" });
  }

  // Availability 10%
  if (mentor.settings) {
    score += 10;
  } else {
    missingFields.push({ label: "Set Availability", href: "/mentor/availability" });
  }

  // Pricing 10%
  if ((mentor.hourlyRate !== undefined && mentor.hourlyRate !== null) || (mentor.sessionTypes && mentor.sessionTypes.length > 0)) {
    score += 10;
  } else {
    missingFields.push({ label: "Set Pricing", href: "/mentor/session-pricing" });
  }

  // Languages 5%
  if (mentor.languages && mentor.languages.length > 0) {
    score += 5;
  } else {
    missingFields.push({ label: "Add Languages", href: "/mentor/profile" });
  }

  // Social Links 5%
  if (mentor.socialProfiles && (mentor.socialProfiles.linkedin || mentor.socialProfiles.twitter || mentor.socialProfiles.github || mentor.socialProfiles.portfolio)) {
    score += 5;
  } else {
    missingFields.push({ label: "Add Social Links", href: "/mentor/profile" });
  }

  return {
    score,
    missingFields,
  };
}
