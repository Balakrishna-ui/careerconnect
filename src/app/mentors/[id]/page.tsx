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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mentor = await prisma.mentor.findUnique({
    where: { id },
    include: { settings: true, skills: true },
  });

  if (!mentor) notFound();

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
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                          {mentor.name}
                        </h1>
                        <p className="text-lg text-foreground/80 font-medium mb-3">
                          {mentor.role} @{" "}
                          <span className="text-foreground font-bold">
                            {mentor.company}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {mentor.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />{" "}
                            {mentor.experienceYears} years Exp.
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2 py-0.5 rounded-md font-medium">
                            <Star className="h-4 w-4 fill-secondary" />
                            {mentor.rating} ({mentor.reviewsCount} reviews)
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

              <TabsContent value="about" className="mt-8 space-y-8">
                <section>
                  <h3 className="text-xl font-bold mb-4">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I&apos;m a {mentor.role} at {mentor.company} with{" "}
                    {mentor.experienceYears} years of experience in the{" "}
                    {mentor.industry} industry. I&apos;m passionate about
                    mentoring and helping professionals grow their careers.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-bold mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-muted/50 font-medium"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-bold mb-4">Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                      <BriefcaseBusiness className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Industry
                        </p>
                        <p className="font-semibold text-sm">
                          {mentor.industry}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Languages
                        </p>
                        <p className="font-semibold text-sm">
                          {languages.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Sessions Completed
                        </p>
                        <p className="font-semibold text-sm">
                          {mentor.totalSessions}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                      <Video className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Remote Available
                        </p>
                        <p className="font-semibold text-sm">
                          {mentor.remoteAvailable ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="text-center py-12 bg-background rounded-2xl border border-dashed">
                  <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">Reviews coming soon</h3>
                  <p className="text-muted-foreground">
                    This mentor has {mentor.totalSessions} completed sessions
                    with high ratings.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Booking Card */}
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-32">
              <Card className="border-none shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Session Price
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight">
                          ₹{mentor.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          / session
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        1:1 Video Call · {sessionDuration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        Actionable Feedback
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={`/mentors/${mentor.id}/book`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full h-14 text-base font-semibold shadow-md"
                      )}
                    >
                      Book a Session
                    </Link>
                    <Link
                      href="/dashboard"
                      className={cn(
                        buttonVariants({ size: "lg", variant: "outline" }),
                        "w-full h-14 text-base"
                      )}
                    >
                      Send a Message
                    </Link>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Free cancellation up to 24h before</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
