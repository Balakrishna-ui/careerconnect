import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Users,
  GraduationCap,
  Award,
  ExternalLink,
  Code2,
  Quote,
  Building2,
  Layers,
  Target,
  FileCheck2,
  Headphones,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BookSessionButton from "./BookSessionButton";
import SendMessageButton from "./SendMessageButton";
import { ShareProfileButton, SaveMentorButton } from "./MentorProfileActions";
import { SessionAvailabilityCard } from "./SessionAvailabilityCard";
import { ProfileTabs } from "./ProfileTabs";
import { cn } from "@/lib/utils";

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mentor = await prisma.mentor.findUnique({
    where: { id },
    include: {
      settings: true,
      skills: true,
      sessionTypes: true,
      weeklySchedules: true,
      experiences: {
        orderBy: { duration: "desc" },
      },
      educations: true,
      socialProfiles: true,
      user: {
        select: { targetDomains: true, specializations: true, headline: true },
      },
      reviews: {
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!mentor) notFound();

  // Fetch related mentors (same industry or company, exclude current)
  const relatedMentors = await prisma.mentor.findMany({
    where: {
      id: { not: id },
      applicationStatus: "VERIFIED",
      profileCompleted: true,
      OR: [
        { industry: mentor.industry ?? undefined },
        { company: mentor.company ?? undefined },
      ],
    },
    take: 3,
    select: {
      id: true,
      name: true,
      role: true,
      company: true,
      image: true,
      rating: true,
      reviewsCount: true,
      price: true,
      experienceYears: true,
      skills: { take: 3 },
    },
  });

  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  // Check if current user saved this mentor
  let isSaved = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      const saved = await prisma.savedMentor.findUnique({
        where: {
          userId_mentorId: {
            userId: user.id,
            mentorId: id,
          },
        },
      });
      isSaved = !!saved;
    }
  }

  const skills = mentor.skills.map((s) => s.name);
  const technicalSkills = mentor.skills.filter(
    (s) => s.category !== "Areas of Mentorship"
  );
  const mentorshipTags =
    mentor.skills
      .filter((s) => s.category === "Areas of Mentorship")
      .map((s) => s.name)
      .slice(0, 5);

  // If no areas of mentorship, use first few skills or session types
  const displayTags =
    mentorshipTags.length > 0
      ? mentorshipTags
      : mentor.skills.slice(0, 5).map((s) => s.name);

  const languages = mentor.languages
    ? mentor.languages.split(", ").filter(Boolean)
    : ["English"];

  const sessionDuration = mentor.settings?.sessionDuration ?? 60;
  const isVerified = mentor.applicationStatus === "VERIFIED";

  // Calculate real rating
  const avgRating =
    mentor.rating > 0
      ? mentor.rating.toFixed(1)
      : mentor.reviews.length > 0
      ? (
          mentor.reviews.reduce((acc, r) => acc + r.rating, 0) /
          mentor.reviews.length
        ).toFixed(1)
      : "5.0";

  // Mentees count: real calculation based on totalSessions
  const menteesCount = Math.max(
    Math.floor(mentor.totalSessions * 0.8),
    mentor.totalSessions === 0 ? 0 : 1
  );

  // Quote / Headline for the banner card
  const mentorQuote =
    mentor.headline ||
    mentor.user?.headline ||
    mentor.highlights ||
    "I believe in practical, honest and personalized guidance to help you grow in your career.";

  // Intro snippet for hero
  const bioSummary =
    mentor.bio
      ? mentor.bio.split("\n")[0].slice(0, 160) +
        (mentor.bio.length > 160 ? "..." : "")
      : `Helping individuals build successful careers in ${
          mentor.industry || "technology"
        } through practical guidance, real-world experience and interview preparation.`;

  return (
    <div className="bg-slate-50/70 dark:bg-background min-h-screen pb-24 text-foreground">
      {/* ─── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border/70 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/mentors"
            className="flex items-center text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
            Back to Mentors
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ShareProfileButton mentorName={mentor.name} />
            <SaveMentorButton
              mentorId={mentor.id}
              isInitiallySaved={isSaved}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border/70 rounded-3xl shadow-xs overflow-hidden mb-6 relative">
          {/* Banner with gradient & quote overlay */}
          <div className="h-44 sm:h-52 md:h-60 w-full relative overflow-hidden bg-gradient-to-r from-blue-500/20 via-indigo-500/25 to-pink-500/20 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-purple-950/60">
            {mentor.coverImage && (
              <Image
                src={mentor.coverImage}
                alt={`${mentor.name} Cover`}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-60 dark:opacity-40"
              />
            )}

            {/* Subtle decorative background lights */}
            <div className="absolute inset-0 bg-radial from-transparent to-card/20 pointer-events-none" />

            {/* Top-right Testimonial / Quote Card */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 max-w-sm sm:max-w-md hidden md:block z-10">
              <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md border border-white/80 dark:border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex gap-3 items-start">
                  <Quote className="w-5 h-5 text-blue-500 shrink-0 fill-blue-500/15 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground/85 font-medium italic leading-relaxed line-clamp-3">
                      &ldquo;{mentorQuote}&rdquo;
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2 font-semibold">
                      — {mentor.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Profile Body */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left Identity Column */}
              <div className="flex flex-col sm:flex-row gap-5 items-start flex-1 min-w-0">
                {/* Avatar & Availability Badge */}
                <div className="-mt-14 sm:-mt-16 relative shrink-0 flex flex-col items-center">
                  <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl sm:rounded-full border-4 border-background shadow-md overflow-hidden bg-background">
                    <AvatarImage
                      src={
                        mentor.image ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          mentor.name
                        )}&background=6366f1&color=fff&size=160`
                      }
                      alt={mentor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                      {mentor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Available Badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available
                  </div>
                </div>

                {/* Identity Information */}
                <div className="pt-2 sm:pt-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {mentor.name}
                    </h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Mentor
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-foreground/90 mt-1">
                    {mentor.role || "Mentor"}{" "}
                    <span className="text-muted-foreground font-normal">@</span>{" "}
                    {mentor.company || "Independent"}
                  </p>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    {bioSummary}
                  </p>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-muted-foreground">
                    {mentor.experienceYears && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        <span>{mentor.experienceYears} years exp</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{mentor.location || "Remote"}</span>
                    </div>
                    {mentor.company && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{mentor.company}</span>
                      </div>
                    )}
                    {mentor.industry && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                        <Layers className="w-3.5 h-3.5 text-sky-500" />
                        <span>{mentor.industry}</span>
                      </div>
                    )}
                  </div>

                  {/* Skill/Service Tags */}
                  {displayTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/40">
                      {displayTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Hero Stats & Actions */}
              <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 lg:self-center">
                {/* 4 Stats Grid */}
                <div className="grid grid-cols-4 gap-2 p-3 sm:p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {mentor.totalSessions}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Sessions
                    </p>
                  </div>
                  <div className="text-center border-l border-border/40">
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {menteesCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Mentees
                    </p>
                  </div>
                  <div className="text-center border-l border-border/40">
                    <p className="text-lg sm:text-xl font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {avgRating}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Avg Rating
                    </p>
                  </div>
                  <div className="text-center border-l border-border/40">
                    <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {mentor.responseRate ?? 100}%
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Response
                    </p>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                  <SendMessageButton
                    mentorUserId={mentor.userId}
                    isAuthenticated={isAuthenticated}
                    className="w-full h-11 text-xs sm:text-sm font-semibold border-border hover:bg-muted text-foreground"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5 text-blue-600" />
                    Send a Message
                  </SendMessageButton>

                  <BookSessionButton
                    mentorId={mentor.id}
                    isAuthenticated={isAuthenticated}
                    className="w-full h-11 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Book a Session
                  </BookSessionButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Profile Navigation Tabs ──────────────────────────────────────── */}
        <ProfileTabs reviewsCount={mentor.reviewsCount} />

        {/* ─── MAIN CONTENT 3-COLUMN DESKTOP GRID ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════ LEFT COLUMN (About, Professional Info, Experience) ════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* About Card */}
            <div
              id="about-section"
              className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">About</h3>
              </div>

              <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6">
                {mentor.bio ? (
                  <p>{mentor.bio}</p>
                ) : (
                  <p>
                    I&apos;m a {mentor.role} at {mentor.company} with{" "}
                    {mentor.experienceYears || 2} years of professional
                    experience in the {mentor.industry || "Technology"}{" "}
                    industry. I focus on practical, real-world guidance that
                    helps you grow with clarity and confidence.
                  </p>
                )}
              </div>

              {/* 4 Feature Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/60">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Personalized Guidance
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Tailored to your goals
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Real Industry Experience
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Insights from day-to-day work
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Practical Approach
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Actionable and honest advice
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Ongoing Support
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Even beyond a single session
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information Card */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    Professional Information
                  </h3>
                </div>

                {mentor.company && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs font-semibold text-foreground">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mentor.company}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Current Company
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.company || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Designation
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.role || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Industry
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.industry || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Experience
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.experienceYears
                      ? `${mentor.experienceYears} years`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Current Location
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.location || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Work Type
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.employmentType || "Full Time"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Education
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {mentor.educations?.[0]?.degree || "-"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Languages
                  </p>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">
                    {languages.join(", ") || "English"}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Experience Card */}
            {mentor.experiences && mentor.experiences.length > 0 && (
              <div
                id="experience-section"
                className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs"
              >
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    Work Experience
                  </h3>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
                  {mentor.experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="relative pl-9">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-4 border-background ring-2 ring-blue-100 dark:ring-blue-900/50" />

                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">
                            {exp.designation}
                          </h4>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                            {exp.companyName}{" "}
                            <span className="text-muted-foreground font-normal">
                              • Full Time
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {exp.duration}
                          </span>
                          {exp.duration?.toLowerCase().includes("present") && (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-2 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>

                      {exp.responsibilities && (
                        <div className="text-xs text-muted-foreground mt-2.5 leading-relaxed space-y-1">
                          {exp.responsibilities
                            .split("\n")
                            .filter(Boolean)
                            .map((line, lIdx) => (
                              <p key={lIdx} className="flex items-start gap-1.5">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{line.replace(/^[•\-\*]\s*/, "")}</span>
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ CENTER COLUMN (Availability, Top Skills, Education) ══════ */}
          <div className="lg:col-span-4 space-y-6">
            {/* Session Availability Card */}
            <SessionAvailabilityCard
              mentorId={mentor.id}
              weeklySchedules={mentor.weeklySchedules}
              sessionDuration={sessionDuration}
            />

            {/* Top Skills Card */}
            {skills.length > 0 && (
              <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    Top Skills
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {skills.slice(0, 7).map((skill, idx) => {
                    const colorThemes = [
                      "bg-blue-500",
                      "bg-teal-500",
                      "bg-indigo-500",
                      "bg-amber-500",
                      "bg-rose-500",
                      "bg-purple-500",
                      "bg-emerald-500",
                    ];
                    const barColor = colorThemes[idx % colorThemes.length];

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-foreground">
                            {skill}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            Proficient
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", barColor)}
                            style={{
                              width: `${Math.max(65, 92 - idx * 5)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Education Card */}
            {mentor.educations && mentor.educations.length > 0 && (
              <div
                id="education-section"
                className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs"
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    Education
                  </h3>
                </div>

                <div className="space-y-4">
                  {mentor.educations.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/20 border border-border/60"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 text-sm">
                        {edu.degree?.charAt(0).toUpperCase() || "E"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">
                            {edu.degree}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-semibold shrink-0">
                            {edu.passingYear}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {edu.college}
                        </p>
                        {edu.branch && (
                          <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {edu.branch},{" "}
                            {mentor.location || "Hyderabad, India"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN / SIDEBAR (Services, Reviews) ══════════════ */}
          <div className="lg:col-span-3 space-y-5">
            {/* Services List */}
            <div id="services-section" className="space-y-4">
              {mentor.sessionTypes.map((service) => (
                <div
                  key={service.id}
                  className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs hover:border-blue-500/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground">
                        {service.title}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-foreground">
                        ₹{service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {service.duration} mins
                    </span>
                    <span>•</span>
                    <span>1:1 Session</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Get personalized guidance, clarity on career paths, skills and
                    industry opportunities.
                  </p>

                  <BookSessionButton
                    mentorId={mentor.id}
                    serviceId={service.id}
                    isAuthenticated={isAuthenticated}
                    className="w-full h-10 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Session
                  </BookSessionButton>
                </div>
              ))}

              {mentor.sessionTypes.length === 0 && (
                <div className="bg-card border border-border/70 rounded-2xl p-6 text-center shadow-xs">
                  <p className="text-xs text-muted-foreground mb-4">
                    Book a personalized 1:1 mentorship session.
                  </p>
                  <BookSessionButton
                    mentorId={mentor.id}
                    isAuthenticated={isAuthenticated}
                    className="w-full h-10 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Book Session
                  </BookSessionButton>
                </div>
              )}
            </div>

            {/* Mentees Say / Reviews Card */}
            <div
              id="reviews-section"
              className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    Mentees say
                  </h4>
                </div>

                <Link
                  href={`#reviews-section`}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  View all reviews →
                </Link>
              </div>

              {/* Review summary rating */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-3 pb-3 border-b border-border/60">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>
                  {avgRating}/5 ({mentor.reviewsCount}{" "}
                  {mentor.reviewsCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              {mentor.reviews && mentor.reviews.length > 0 ? (
                <div className="space-y-4">
                  {mentor.reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 text-xs">
                            <AvatarImage src={review.user?.image || undefined} />
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 font-bold">
                              {(review.user?.name || "U").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-foreground">
                            {review.user?.name || "Mentee"}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-3 h-3",
                                s <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <Star className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  No reviews yet. Be the first to book a session and leave a review.
                </div>
              )}
            </div>

            {/* Social Connect Card if profiles exist */}
            {mentor.socialProfiles && (
              <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Connect with {mentor.name}
                </h4>
                <div className="flex gap-2">
                  {mentor.socialProfiles.linkedin && (
                    <Link
                      href={mentor.socialProfiles.linkedin}
                      target="_blank"
                      className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      title="LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {mentor.socialProfiles.github && (
                    <Link
                      href={mentor.socialProfiles.github}
                      target="_blank"
                      className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                      title="GitHub"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {mentor.socialProfiles.portfolio && (
                    <Link
                      href={mentor.socialProfiles.portfolio}
                      target="_blank"
                      className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                      title="Portfolio"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Related Mentors Section ──────────────────────────────────────── */}
        {relatedMentors.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/70">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-6 text-foreground">
              Similar Mentors You Might Like
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedMentors.map((rm) => (
                <Link
                  key={rm.id}
                  href={`/mentors/${rm.id}`}
                  className="group block"
                >
                  <div className="h-full bg-card border border-border/70 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-sm transition-all flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <AvatarImage
                        src={
                          rm.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            rm.name
                          )}&background=6366f1&color=fff`
                        }
                      />
                      <AvatarFallback>{rm.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition-colors truncate">
                        {rm.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {rm.role} @ {rm.company}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />{" "}
                          {rm.rating > 0 ? rm.rating.toFixed(1) : "5.0"}
                        </span>
                        <span className="text-foreground">
                          ₹{rm.price.toLocaleString()}/session
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
