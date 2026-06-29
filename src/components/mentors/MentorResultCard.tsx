import Link from "next/link";
import { ShieldCheck, Star, Clock, MapPin, Users, Globe, Video, Headphones, MessageSquare, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  companyTier: string;
  industry: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  price: number;
  verified: boolean;
  image: string | null;
  location: string;
  languages: string;
  remoteAvailable: boolean;
  nextAvailable: Date | null;
  totalSessions: number;
  skills: string;
  goals: string;
}

interface MentorResultCardProps {
  mentor: Mentor;
  view?: "grid" | "list";
}

const TIER_COLORS: Record<string, string> = {
  FAANG: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Big Tech": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Consulting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Unicorn Startups": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "IT Services": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
};

function formatNextAvailable(date: Date | null): string {
  if (!date) return "Available soon";
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Available Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Available Tomorrow";
  return `Available ${d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("w-3.5 h-3.5", s <= Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function MentorResultCard({ mentor, view = "grid" }: MentorResultCardProps) {
  const skills = mentor.skills.split(", ").filter(Boolean);
  const languages = mentor.languages.split(", ").filter(Boolean);
  const tierColor = TIER_COLORS[mentor.companyTier] ?? "bg-muted text-muted-foreground";

  if (view === "list") {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-5 flex gap-5 hover:border-primary/30 hover:shadow-md transition-all group">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={mentor.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=96`}
            alt={mentor.name}
            className="w-20 h-20 rounded-xl object-cover border-2 border-background shadow"
          />
          {mentor.verified && (
            <div className="absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5 shadow">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                  {mentor.name}
                </h3>
                {mentor.verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-xs px-2 py-0">
                    Verified ✓
                  </Badge>
                )}
                <Badge className={cn("border-0 text-xs px-2 py-0", tierColor)}>
                  {mentor.companyTier}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {mentor.role} <span className="text-foreground font-medium">@ {mentor.company}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold">₹{mentor.price.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">per session</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {mentor.experienceYears} yrs exp
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {mentor.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {mentor.totalSessions} sessions
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> {languages.slice(0, 2).join(", ")}
            </div>
            {mentor.remoteAvailable && (
              <div className="flex items-center gap-1 text-emerald-600">
                <Video className="w-3.5 h-3.5" /> Remote
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs bg-muted/60 font-normal px-2 py-0">
                {s}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge variant="secondary" className="text-xs bg-muted/60 font-normal px-2 py-0">
                +{skills.length - 5}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <StarRating rating={mentor.rating} />
              <span className="text-sm font-semibold">{mentor.rating}</span>
              <span className="text-xs text-muted-foreground">({mentor.reviewsCount} reviews)</span>
              <span className="text-xs text-emerald-600 font-medium ml-2">
                🟢 {formatNextAvailable(mentor.nextAvailable)}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/mentors/${mentor.id}`}>
                <Button variant="outline" size="sm" className="rounded-lg text-xs">View Profile</Button>
              </Link>
              <Link href={`/mentors/${mentor.id}`}>
                <Button size="sm" className="rounded-lg text-xs">Book Session</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Top gradient stripe */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-violet-500 to-indigo-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <img
              src={mentor.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff&size=80`}
              alt={mentor.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-background shadow-md"
            />
            {mentor.verified && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5 shadow">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground">₹{mentor.price.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">/ session</div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{mentor.rating}</span>
              <span className="text-xs text-muted-foreground">({mentor.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Name and role */}
        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors mb-0.5">
          {mentor.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">
          {mentor.role}
        </p>
        <p className="text-sm font-semibold mb-3">
          @ {mentor.company}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {mentor.experienceYears} yrs
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {mentor.location}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {mentor.totalSessions} sessions
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={cn("border-0 text-xs px-2 py-0", tierColor)}>
            {mentor.companyTier}
          </Badge>
          {mentor.verified && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-xs px-2 py-0">
              Verified ✓
            </Badge>
          )}
          {mentor.remoteAvailable && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs px-2 py-0">
              Remote
            </Badge>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs bg-muted/60 font-normal px-2 py-0">
              {s}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="secondary" className="text-xs bg-muted/60 font-normal px-2 py-0">
              +{skills.length - 4}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 pt-3 space-y-2 mt-auto">
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatNextAvailable(mentor.nextAvailable)}
          </div>
          <div className="flex gap-2">
            <Link href={`/mentors/${mentor.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">View Profile</Button>
            </Link>
            <Link href={`/mentors/${mentor.id}`} className="flex-1">
              <Button size="sm" className="w-full rounded-lg text-xs">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
