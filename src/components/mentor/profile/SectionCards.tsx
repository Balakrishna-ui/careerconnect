"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMentorProfile } from "@/contexts/MentorProfileContext";

export function SectionCards() {
  const { mentorData: mentor } = useMentorProfile();

  if (!mentor) return null;

  return (
    <div className="space-y-6">
      
      {/* About Me */}
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">About Me</h3>
        </div>
        <CardContent className="p-6">
          {mentor.bio ? (
            <div className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
              {mentor.bio}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No about information added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Experience</h3>
        </div>
        <CardContent className="p-6">
          {mentor.experiences && mentor.experiences.length > 0 ? (
            <div className="space-y-6">
              {mentor.experiences.map((exp: any, i: number) => (
                <div key={i} className="relative pl-6 border-l-2 border-gray-200 pb-6 last:pb-0">
                  <div className="absolute w-3 h-3 bg-white border-2 border-orange-500 rounded-full -left-[7px] top-1.5"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-[16px] font-bold text-gray-900">{exp.designation}</h4>
                      <p className="text-[15px] font-medium text-gray-700">{exp.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>{exp.duration}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  {exp.responsibilities && (
                    <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
                      {exp.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No experience added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Education</h3>
        </div>
        <CardContent className="p-6">
          {mentor.educations && mentor.educations.length > 0 ? (
            <div className="space-y-6">
              {mentor.educations.map((edu: any, i: number) => (
                <div key={i} className="relative pl-6 border-l-2 border-gray-200 pb-6 last:pb-0">
                  <div className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -left-[7px] top-1.5"></div>
                  <h4 className="text-[16px] font-bold text-gray-900">
                    {edu.degree} {edu.branch ? `in ${edu.branch}` : ''}
                  </h4>
                  <p className="text-[15px] font-medium text-gray-700">{edu.college}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    {edu.passingYear && <span>Class of {edu.passingYear}</span>}
                    {edu.cgpa && (
                      <>
                        <span>•</span>
                        <span>{edu.scoreType === 'Percentage' ? `${edu.cgpa}%` : `CGPA: ${edu.cgpa}`}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No education added yet.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
