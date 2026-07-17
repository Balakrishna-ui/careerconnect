export function calculateProfileCompletion(mentor: any) {
  let score = 0;
  const missingFields: { label: string; href: string; percentage: number }[] = [];

  // Photo 10%
  if (mentor.user?.image || mentor.image) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Profile Picture", href: "#profile-photo", percentage: 10 });
  }

  // Headline 10%
  if (mentor.headline && mentor.headline.trim().length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Headline", href: "#resume-headline", percentage: 10 });
  }

  // About 10%
  if (mentor.bio && mentor.bio.trim().length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add About Section", href: "#about", percentage: 10 });
  }

  // Experience 15%
  if (mentor.experiences && mentor.experiences.length > 0) {
    score += 15;
  } else {
    missingFields.push({ label: "Add Experience", href: "#experience", percentage: 15 });
  }

  // Skills 15%
  if (mentor.skills && mentor.skills.length > 0) {
    score += 15;
  } else {
    missingFields.push({ label: "Add Skills", href: "#skills", percentage: 15 });
  }

  // Education 10%
  if (mentor.educations && mentor.educations.length > 0) {
    score += 10;
  } else {
    missingFields.push({ label: "Add Education", href: "#education", percentage: 10 });
  }

  // Availability 5%
  if (mentor.settings) {
    score += 5;
  } else {
    missingFields.push({ label: "Complete Availability", href: "#availability", percentage: 5 });
  }

  // Pricing 5%
  if (mentor.sessionTypes && mentor.sessionTypes.length > 0) {
    score += 5;
  } else {
    missingFields.push({ label: "Set Session Pricing", href: "#session-pricing", percentage: 5 });
  }

  // Resume 5%
  if (mentor.resumeUrl) {
    score += 5;
  } else {
    missingFields.push({ label: "Upload Resume", href: "#resume", percentage: 5 });
  }

  // Projects 5%
  if (mentor.projects && mentor.projects.length > 0) {
    score += 5;
  } else {
    missingFields.push({ label: "Add Project", href: "#projects", percentage: 5 });
  }

  // Portfolio 5%
  if (mentor.socialProfiles && (mentor.socialProfiles.portfolio || mentor.socialProfiles.github || mentor.socialProfiles.linkedin || mentor.socialProfiles.behance)) {
    score += 5;
  } else {
    missingFields.push({ label: "Add Portfolio", href: "#portfolio", percentage: 5 });
  }

  // Verification 5%
  if (mentor.documents && mentor.documents.some((d: any) => d.status === "VERIFIED")) {
    score += 5;
  } else {
    missingFields.push({ label: "Upload Verification", href: "#verification-documents", percentage: 5 });
  }

  // Ensure score doesn't exceed 100 somehow
  score = Math.min(score, 100);

  return {
    score,
    missingFields,
  };
}
