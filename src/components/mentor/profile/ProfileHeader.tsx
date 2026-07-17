"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMentorProfile } from "@/contexts/MentorProfileContext";

export function ProfileHeader() {
  const { 
    mentorData: mentor, 
    completionScore, 
    missingDetails, 
    globalSave, 
    isSaving,
    handleNextMissingDetail,
    pendingChanges
  } = useMentorProfile();

  const missingCount = missingDetails.length;
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Card className="shadow-sm border-border overflow-hidden bg-gradient-to-r from-blue-50/50 to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left: Avatar & Progress Ring */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-muted border-4 border-background shadow-sm overflow-hidden flex items-center justify-center relative">
              {mentor?.image || mentor?.user?.image ? (
                <Image src={mentor?.image || mentor?.user?.image} alt={mentor?.user?.name || "Profile"} fill className="object-cover" />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">
                  {mentor?.user?.name?.substring(0, 2).toUpperCase() || mentor?.name?.substring(0, 2).toUpperCase() || "ME"}
                </span>
              )}
              
              {/* Circular Progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/30" />
                <circle 
                  cx="64" cy="64" r="60" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="377" 
                  strokeDashoffset={377 - (377 * completionScore) / 100} 
                  className="text-amber-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute bottom-2 bg-background rounded-full px-2 py-0.5 text-xs font-bold shadow-sm border border-border">
                {completionScore}%
              </div>
            </div>
          </div>

          {/* Center: Details */}
          <div className="flex-grow space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {mentor?.name || mentor?.user?.name || "N/A"}
                <button className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                Profile last updated - <span className="font-medium text-foreground">Today</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {mentor?.city ? `${mentor.city}, ${mentor.country}` : mentor?.location || "Location not added"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {mentor?.mobile || mentor?.user?.mobile || "Phone not added"}
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                {mentor?.experienceYears ? `${mentor.experienceYears} Years Exp` : "Experience not added"}
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{mentor?.user?.email || "Email not added"}</span>
                <BadgeCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {mentor?.noticePeriod ? `Notice Period: ${mentor.noticePeriod}` : "Notice Period not added"}
              </div>
            </div>
          </div>

          {/* Right: Actions & Missing Details */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  await globalSave();
                  window.open(`/mentors/${mentor?.id || mentor?.userId}`, '_blank');
                }}
                disabled={!hasPendingChanges || isSaving}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 ${hasPendingChanges ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>

            {/* Missing Details Card */}
            {missingCount > 0 ? (
              <div className="bg-background rounded-xl p-4 border border-amber-100 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-700 mb-2">Complete your profile</h4>
                  {missingDetails.slice(0, 3).map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Add {detail.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-amber-600 font-semibold">+10%</span>
                    </div>
                  ))}
                  {missingCount > 3 && (
                    <p className="text-xs text-muted-foreground italic">+{missingCount - 3} more items</p>
                  )}
                </div>
                
                <button 
                  onClick={handleNextMissingDetail}
                  className="w-full mt-4 bg-[#FF6B4A] hover:bg-[#ff5530] text-white py-2 rounded-full text-sm font-semibold transition-colors"
                >
                  Add {missingCount} missing details
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-sm text-center">
                <BadgeCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-green-700">Profile Complete!</h4>
                <p className="text-xs text-green-600 mt-1">Your profile is 100% complete and looks great to mentees.</p>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
