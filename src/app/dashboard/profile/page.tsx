import React from "react";
import { User, MapPin, Briefcase, Mail, Edit3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getJobSeekerProfile } from "@/actions/job-seeker-profile-actions";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getJobSeekerProfile();

  if (!user) {
    redirect("/signup?view=login");
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Calculate profile completion roughly
  let filledFields = 0;
  const totalFields = 11; // headline, bio, location, jobTitle, currentCompany, expectedSalary, skills, targetDomains, etc.
  if (user.headline) filledFields++;
  if (user.bio) filledFields++;
  if (user.location) filledFields++;
  if (user.jobTitle) filledFields++;
  if (user.currentCompany) filledFields++;
  if (user.expectedSalary) filledFields++;
  if (user.skills?.length > 0) filledFields++;
  if (user.experiences?.length > 0) filledFields++;
  if (user.educations?.length > 0) filledFields++;
  if (user.socialProfile) filledFields++;
  if (user.targetDomains) filledFields++;
  
  const completionPercent = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative">
        {user.coverImage && (
           <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/10"></div>
        <Button variant="secondary" className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md">
          <Edit3 className="w-4 h-4 mr-2" /> Edit Cover
        </Button>
      </div>

      <div className="px-6 md:px-10 relative">
        {/* Profile Info Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-8 relative z-10">
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-slate-900 shadow-xl bg-white">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
          
          <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                {user.name} <ShieldCheck className="w-6 h-6 text-blue-500" />
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                {user.headline || user.jobTitle || "Job Seeker"} {user.currentCompany ? `at ${user.currentCompany}` : ""}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location || user.city || "Location not set"}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {user.experienceYears ? `${user.experienceYears} Yrs Exp` : "Experience not set"}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">Share Profile</Button>
              <Link href="/dashboard/profile/edit">
                <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">About Me</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {user.bio || "No bio added yet."}
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Experience</h2>
              {user.experiences && user.experiences.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pb-4">
                  {user.experiences.map((exp: any, i: number) => (
                    <div key={exp.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 bg-white dark:bg-slate-900 border-4 ${i === 0 ? 'border-blue-500' : 'border-slate-300'} w-4 h-4 rounded-full`}></div>
                      <h3 className="font-bold text-lg">{exp.designation}</h3>
                      <p className="text-slate-600 font-medium mb-1">{exp.companyName}</p>
                      <p className="text-sm text-slate-500 mb-2">{exp.duration}</p>
                      {exp.responsibilities && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{exp.responsibilities}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No experience added yet.</p>
              )}
            </div>
            
            {/* Education */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Education</h2>
              {user.educations && user.educations.length > 0 ? (
                <div className="space-y-6">
                  {user.educations.map((edu: any) => (
                    <div key={edu.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-bold text-lg">{edu.degree}</h3>
                      <p className="text-slate-600 font-medium">{edu.college}</p>
                      <p className="text-sm text-slate-500">Class of {edu.passingYear} {edu.cgpa && `• CGPA: ${edu.cgpa}`}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No education added yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Skills */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: any) => (
                    <Badge key={skill.id} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No skills added yet.</p>
              )}
            </div>
            
            {/* Completion Status */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-orange-900 dark:text-orange-400 mb-2">Profile Completion</h2>
              <div className="w-full bg-white dark:bg-slate-800 rounded-full h-2.5 mb-4">
                <div className={`bg-[#FF6B00] h-2.5 rounded-full`} style={{ width: `${completionPercent}%` }}></div>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Your profile is {completionPercent}% complete. {completionPercent < 100 && "Add more details to reach 100% and attract better opportunities!"}
              </p>
              {completionPercent < 100 && (
                <Link href="/dashboard/profile/edit" className="block mt-4">
                  <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e66000] text-white w-full">Complete Profile</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
