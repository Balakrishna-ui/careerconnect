import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  BriefcaseBusiness,
  Calendar,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Video,
  Globe,
  Users,
  GraduationCap,
  Award,
  ExternalLink,
  Code2,
  MessageCircle,
  Activity,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BookSessionButton from "./BookSessionButton";

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
      experiences: {
        orderBy: { duration: 'desc' }
      },
      educations: true,
      socialProfiles: true,
      reviews: {
        include: {
          user: {
            select: { name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
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
        { company: mentor.company ?? undefined }
      ]
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
      skills: { take: 3 }
    }
  });

  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  const skills = mentor.skills.map((s) => s.name);
  const languages = mentor.languages ? mentor.languages.split(", ").filter(Boolean) : [];
  const sessionDuration = mentor.settings?.sessionDuration ?? 60;
  const isVerified = mentor.applicationStatus === "VERIFIED";

  return (
    <div className="bg-muted/10 min-h-screen pb-24">
      {/* Top Navigation */}
      <div className="bg-background border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link
            href="/mentors"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mentors
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Header Profile Card */}
            <Card className="overflow-hidden border-none shadow-md">
              <div className="h-32 bg-gradient-to-r from-primary/20 via-blue-500/20 to-secondary/20" />
              <CardContent className="pt-0 relative px-6 sm:px-10 pb-10">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="-mt-16 relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                      <AvatarImage
                        src={
                          mentor.image ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=128`
                        }
                        alt={mentor.name}
                      />
                      <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isVerified && (
                      <div
                        className="absolute bottom-1 right-1 bg-background rounded-full p-0.5 shadow-sm"
                        title="Verified Employee"
                      >
                        <ShieldCheck className="h-7 w-7 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <div className="pt-2 sm:pt-4 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h1 className="text-3xl font-bold tracking-tight">
                            {mentor.name}
                          </h1>
                          {mentor.profileCompleted && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Profile {mentor.completionScore}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg text-foreground/80 font-medium mb-3">
                          {mentor.role} @{" "}
                          <span className="text-foreground font-bold">
                            {mentor.company}
                          </span>
                        </p>
                        
                        {/* New Metrics Grid */}
                        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mt-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" /> {mentor.location || "Remote"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-primary" />{" "}
                            {mentor.experienceYears} Years Exp.
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-foreground">{mentor.rating}</span> ({mentor.reviewsCount} Reviews)
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            Helped {Math.max(Math.floor(mentor.totalSessions * 0.8), mentor.totalSessions === 0 ? 0 : 1)} Professionals
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Video className="h-4 w-4 text-primary" />
                            {mentor.totalSessions} Sessions Completed
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                            Replies within 2 hours
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Active Today</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="h-4 w-4" />
                            Mentor Since {mentor.createdAt.getFullYear()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start h-14 bg-transparent border-b rounded-none p-0">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 h-full font-medium"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 h-full font-medium"
                >
                  Reviews ({mentor.reviewsCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-8 space-y-10">
                {/* About Section */}
                <section>
                  <h3 className="text-xl font-bold mb-4">About</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {mentor.bio ? (
                      <p>{mentor.bio}</p>
                    ) : (
                      <p>
                        I&apos;m a {mentor.role} at {mentor.company} with{" "}
                        {mentor.experienceYears} years of experience in the{" "}
                        {mentor.industry} industry. I&apos;m passionate about
                        mentoring and helping professionals grow their careers.
                      </p>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Expertise Section */}
                {mentor.skills.length > 0 && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold mb-4">Expertise</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {mentor.skills
                          .filter(s => s.category !== "Areas of Mentorship")
                          .map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className="px-4 py-2 text-sm bg-muted/60 hover:bg-muted font-medium rounded-lg"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

                {/* Professional Information */}
                <section>
                  <h3 className="text-xl font-bold mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/20 p-6 rounded-2xl border border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Company</p>
                      <p className="font-semibold text-foreground">{mentor.company || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Designation</p>
                      <p className="font-semibold text-foreground">{mentor.role || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Industry</p>
                      <p className="font-semibold text-foreground">{mentor.industry || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Experience</p>
                      <p className="font-semibold text-foreground">{mentor.experienceYears ? `${mentor.experienceYears} Years` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employment</p>
                      <p className="font-semibold text-foreground">{mentor.employmentType || "Full Time"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="font-semibold text-foreground">{mentor.location || "-"}</p>
                    </div>
                    {mentor.noticePeriod && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notice Period</p>
                        <p className="font-semibold text-foreground">{mentor.noticePeriod}</p>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Languages Section */}
                {languages.length > 0 && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold mb-4">Languages</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {languages.map((lang) => (
                          <div key={lang} className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
                            <Globe className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">{lang}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

                {/* Availability Section */}
                {mentor.skills.filter(s => s.category === "Areas of Mentorship").length > 0 && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold mb-4">What I can help with</h3>
                      <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                        {mentor.skills
                          .filter(s => s.category === "Areas of Mentorship")
                          .map((skill) => (
                            <div key={skill.id} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                              <span className="text-foreground font-medium">{skill.name}</span>
                            </div>
                          ))}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

                {/* Work Experience */}
                {mentor.experiences && mentor.experiences.length > 0 && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold mb-6">Work Experience</h3>
                      <div className="space-y-6">
                        {mentor.experiences.map((exp) => (
                          <div key={exp.id} className="relative pl-6 border-l-2 border-muted">
                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                            <h4 className="text-lg font-bold text-foreground">{exp.designation}</h4>
                            <p className="text-primary font-medium mb-1">{exp.companyName}</p>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" /> {exp.duration}
                            </p>
                            {exp.responsibilities && (
                              <p className="text-muted-foreground text-sm leading-relaxed mt-2">{exp.responsibilities}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

                {/* Education */}
                {mentor.educations && mentor.educations.length > 0 && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold mb-6">Education</h3>
                      <div className="space-y-6">
                        {mentor.educations.map((edu) => (
                          <div key={edu.id} className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-foreground">{edu.degree}</h4>
                              <p className="text-muted-foreground font-medium mb-1">{edu.college}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Graduated {edu.passingYear}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

                {/* Statistics Block */}
                <section>
                  <h3 className="text-xl font-bold mb-4">Professional Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 text-center">
                      <p className="text-3xl font-bold text-primary mb-1">{mentor.totalSessions}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sessions</p>
                    </div>
                    <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 text-center dark:bg-emerald-900/10 dark:border-emerald-900/20">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        {Math.max(Math.floor(mentor.totalSessions * 0.8), mentor.totalSessions === 0 ? 0 : 1)}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mentees</p>
                    </div>
                    <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 text-center dark:bg-amber-900/10 dark:border-amber-900/20">
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{mentor.rating}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Rating</p>
                    </div>
                    <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10 text-center dark:bg-blue-900/10 dark:border-blue-900/20">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{mentor.reviewsCount}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reviews</p>
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8 space-y-6">
                {mentor.reviews && mentor.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {mentor.reviews.map((review) => (
                      <div key={review.id} className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || "User")}`} />
                              <AvatarFallback>{(review.user?.name || "U").charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{review.user?.name || "Anonymous User"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            {review.rating}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                    <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-1">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Be the first to book a session and leave a review.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Services List */}
          <div className="w-full lg:w-[380px] space-y-4">
            <h2 className="text-xl font-bold mb-4">Services Offered</h2>
            
            {mentor.sessionTypes.map(service => (
              <Card key={service.id} className="border border-border shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-base text-foreground mb-1">{service.title}</h3>
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary"/> {service.duration} mins</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-primary"/> 1:1 Video</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">Free cancellation up to 24 hours</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">₹{service.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <BookSessionButton mentorId={mentor.id} serviceId={service.id} isAuthenticated={isAuthenticated} />
                </CardContent>
              </Card>
            ))}

            {mentor.sessionTypes.length === 0 && (
              <div className="text-center p-6 bg-muted/30 rounded-2xl border border-dashed">
                <p className="text-muted-foreground text-sm">No services listed yet.</p>
              </div>
            )}

            {/* Social Links */}
            {mentor.socialProfiles && (
              <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="font-bold text-base mb-4">Connect</h3>
                  <div className="flex gap-3">
                    {mentor.socialProfiles.linkedin && (
                      <Link href={mentor.socialProfiles.linkedin} target="_blank" className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    )}
                    {mentor.socialProfiles.github && (
                      <Link href={mentor.socialProfiles.github} target="_blank" className="w-10 h-10 rounded-full bg-foreground/5 text-foreground flex items-center justify-center hover:bg-foreground/10 transition-colors">
                        <Code2 className="w-5 h-5" />
                      </Link>
                    )}
                    {mentor.socialProfiles.twitter && (
                      <Link href={mentor.socialProfiles.twitter} target="_blank" className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center hover:bg-sky-500/20 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </Link>
                    )}
                    {mentor.socialProfiles.portfolio && (
                      <Link href={mentor.socialProfiles.portfolio} target="_blank" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Globe className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-muted/20">
              <CardContent className="p-5">
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "w-full h-12 text-sm bg-background"
                  )}
                >
                  Send a Message
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Mentors */}
        {relatedMentors.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Mentors</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMentors.map((rm) => (
                <Link key={rm.id} href={`/mentors/${rm.id}`} className="group block">
                  <Card className="h-full border border-border hover:border-primary/50 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                          <AvatarImage src={rm.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(rm.name)}&background=6366f1&color=fff`} />
                          <AvatarFallback>{rm.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{rm.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{rm.role} @ {rm.company}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-500" /> {rm.rating}
                            </span>
                            <span className="text-muted-foreground">₹{rm.price.toLocaleString()}/session</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
