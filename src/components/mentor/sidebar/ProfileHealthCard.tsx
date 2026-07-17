"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, MapPin, Building, Briefcase, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface MissingField {
  label: string;
  href: string;
}

interface ProfileHealthCardProps {
  mentorName: string;
  image: string | null;
  headline: string | null;
  company: string | null;
  location: string | null;
  experience: number | null;
  isVerified: boolean;
  completionScore: number;
  missingFields: MissingField[];
  lastUpdated: string;
}

export function ProfileHealthCard({
  mentorName,
  image,
  headline,
  company,
  location,
  experience,
  isVerified,
  completionScore,
  missingFields,
  lastUpdated
}: ProfileHealthCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleFields = isExpanded ? missingFields : missingFields.slice(0, 3);
  const hiddenCount = missingFields.length - 3;

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col items-center p-6 text-center border-b border-border relative">
          <Link 
            href="/mentor/profile" 
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors z-10"
            title="Edit Profile"
          >
            <Pencil className="w-4 h-4" />
            <span className="sr-only">Edit Profile</span>
          </Link>
          <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-sm overflow-hidden flex items-center justify-center relative mb-4">
            {image ? (
              <Image src={image} alt={mentorName} fill className="object-cover" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">{mentorName.substring(0, 2).toUpperCase()}</span>
            )}
            
            {/* Circular Progress (Simplified to ring for now) */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
              <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/30" />
              <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="289" strokeDashoffset={289 - (289 * completionScore) / 100} className="text-blue-500 transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute -bottom-1 bg-background rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm border border-border">
              {completionScore}%
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-foreground flex items-center gap-1 justify-center">
            {mentorName}
            {isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1 px-4 line-clamp-2">
            {headline || "Complete your profile to add a headline"}
          </p>
          
          <Link 
            href="/mentor/profile" 
            className="w-[85%] mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-full flex items-center justify-center transition-colors text-sm shadow-sm"
          >
            View & Update Profile
          </Link>
          
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-4 text-xs text-muted-foreground">
            {company && (
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {company}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </span>
            )}
            {experience ? (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {experience} Yrs Exp
              </span>
            ) : null}
          </div>
          
          <p className="text-[10px] text-muted-foreground mt-4">Last updated {lastUpdated}</p>
        </div>
        
        <div className="p-5 bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Profile completion</span>
            <span className="text-sm font-bold text-blue-600">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-2 mb-4 bg-blue-100" />
          
          {missingFields.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Missing Details:</p>
              <ul className="text-xs space-y-1.5">
                {visibleFields.map((field, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <Link href={field.href} className="text-foreground hover:text-primary hover:underline transition-colors">
                      {field.label}
                    </Link>
                  </li>
                ))}
                {!isExpanded && hiddenCount > 0 && (
                  <li>
                    <button 
                      onClick={() => setIsExpanded(true)}
                      className="text-muted-foreground hover:text-foreground pl-3.5 text-[10px] flex items-center gap-1 transition-colors"
                    >
                      +{hiddenCount} more <ChevronDown className="w-3 h-3" />
                    </button>
                  </li>
                )}
                {isExpanded && hiddenCount > 0 && (
                  <li>
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="text-muted-foreground hover:text-foreground pl-3.5 text-[10px] flex items-center gap-1 transition-colors"
                    >
                      Show less <ChevronUp className="w-3 h-3" />
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
