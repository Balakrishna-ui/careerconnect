"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Briefcase, GraduationCap, MapPin, FileText, Mail, Phone, Clock, Target, CheckCircle2 } from "lucide-react";

interface MenteeProfileDialogProps {
  user: any;
}

export function MenteeProfileDialog({ user }: MenteeProfileDialogProps) {
  if (!user) return null;

  return (
    <Dialog>
      <DialogTrigger className="text-blue-600 hover:underline font-medium focus:outline-none">
        {user.name}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{user.name}</DialogTitle>
          <DialogDescription className="text-sm">
            Detailed profile and career preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-500" />
                {user.email}
              </div>
            )}
            {user.mobile && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-500" />
                {user.mobile}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500" />
                {user.location}
              </div>
            )}
            {user.resumeUrl && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-blue-500" />
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  View Resume
                </a>
              </div>
            )}
          </div>

          {/* Career Preferences */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
              <Target className="w-5 h-5 text-blue-600" /> Career Preferences
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div><span className="text-gray-500">Experience Level:</span> {user.isFresher ? "Fresher" : "Experienced"}</div>
              <div><span className="text-gray-500">Employment Status:</span> {user.employmentStatus || "N/A"}</div>
              <div><span className="text-gray-500">Target Role:</span> {user.targetJobTitle || "N/A"}</div>
              <div><span className="text-gray-500">Work Mode:</span> {user.workPreferences || "N/A"}</div>
              <div><span className="text-gray-500">Current Salary:</span> {user.currentSalary ? `${user.currentSalary} LPA` : "N/A"}</div>
              <div><span className="text-gray-500">Expected Salary:</span> {user.expectedSalary ? `${user.expectedSalary} LPA` : "N/A"}</div>
              <div><span className="text-gray-500">Notice Period:</span> {user.noticePeriod || "N/A"}</div>
            </div>
            
            {user.targetDomains && (
              <div className="pt-2">
                <span className="text-gray-500 text-sm block mb-1">Target Domains:</span>
                <div className="flex flex-wrap gap-2">
                  {user.targetDomains.split(',').map((d: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {d.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {user.specializations && (
              <div className="pt-2">
                <span className="text-gray-500 text-sm block mb-1">Specializations:</span>
                <div className="flex flex-wrap gap-2">
                  {user.specializations.split(',').map((s: string, i: number) => (
                    <Badge key={i} variant="outline">
                      {s.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          {user.experiences && user.experiences.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Work Experience
              </h3>
              <div className="space-y-4">
                {user.experiences.map((exp: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      {i !== user.experiences.length - 1 && <div className="w-0.5 h-full bg-gray-200 mx-auto mt-1"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{exp.designation || exp.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{exp.companyName} {exp.location ? `• ${exp.location}` : ""}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {exp.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {user.educations && user.educations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Education
              </h3>
              <div className="space-y-4">
                {user.educations.map((edu: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      {i !== user.educations.length - 1 && <div className="w-0.5 h-full bg-gray-200 mx-auto mt-1"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree} {edu.branch ? `in ${edu.branch}` : ""}</h4>
                      <p className="text-sm text-gray-600">{edu.college}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Class of {edu.passingYear} • {edu.scoreType}: {edu.cgpa}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill: any, i: number) => (
                  <Badge key={i} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
