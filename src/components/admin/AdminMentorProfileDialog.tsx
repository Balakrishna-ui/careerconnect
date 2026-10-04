"use client";

import { useState, useEffect } from "react";
import { getMentorFullProfile } from "@/actions/admin-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Briefcase, GraduationCap, MapPin, Mail, Award, Clock } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminMentorProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string | null;
}

export function AdminMentorProfileDialog({
  isOpen,
  onClose,
  mentorId
}: AdminMentorProfileDialogProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mentorId) {
      setIsLoading(true);
      getMentorFullProfile(mentorId)
        .then((data) => setProfile(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setProfile(null);
    }
  }, [isOpen, mentorId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mentor Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !profile ? (
          <div className="text-center py-12 text-muted-foreground">
            Could not load profile.
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24 border">
                <AvatarImage src={profile.user.image || profile.image} />
                <AvatarFallback>{profile.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.user.name || profile.name}</h2>
                    <p className="text-muted-foreground text-lg">{profile.headline || profile.role || "Mentor"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={profile.applicationStatus.toLowerCase()} />
                    <StatusBadge status={profile.user.accountStatus.toLowerCase()} />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.user.email}
                  </div>
                  {(profile.location || profile.city) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.city ? `${profile.city}, ${profile.country}` : profile.location}
                    </div>
                  )}
                  {profile.experienceYears && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {profile.experienceYears} Years Experience
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            {profile.bio && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">About</h3>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Two Column Layout for Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Experience */}
                {profile.experiences && profile.experiences.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      Experience
                    </h3>
                    <div className="space-y-4">
                      {profile.experiences.map((exp: any) => (
                        <div key={exp.id}>
                          <h4 className="font-medium text-sm">{exp.title}</h4>
                          <div className="text-sm text-muted-foreground">{exp.company}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(exp.startDate).getFullYear()} - {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.educations && profile.educations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {profile.educations.map((edu: any) => (
                        <div key={edu.id}>
                          <h4 className="font-medium text-sm">{edu.degree}</h4>
                          <div className="text-sm text-muted-foreground">{edu.institution}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(edu.startDate).getFullYear()} - {edu.current ? "Present" : edu.endDate ? new Date(edu.endDate).getFullYear() : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                      <Award className="w-5 h-5 text-muted-foreground" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: any) => (
                        <span key={skill.id} className="px-3 py-1 bg-muted text-xs rounded-full">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Types */}
                {profile.sessionTypes && profile.sessionTypes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      Offered Sessions
                    </h3>
                    <div className="space-y-3">
                      {profile.sessionTypes.map((session: any) => (
                        <div key={session.id} className="p-3 border rounded-lg bg-card">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-sm">{session.title}</h4>
                            <span className="font-semibold text-sm">${session.price}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.duration} minutes
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
