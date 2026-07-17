"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface MentorProfileContextProps {
  mentorData: any;
  setMentorData: React.Dispatch<React.SetStateAction<any>>;
  completionScore: number;
  missingDetails: string[];
  pendingChanges: { [key: string]: any };
  setPendingChanges: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  saveSection: (field: string, data: any) => Promise<boolean>;
  globalSave: () => Promise<void>;
  handleNextMissingDetail: () => void;
  isSaving: boolean;
}

const MentorProfileContext = createContext<MentorProfileContextProps | undefined>(undefined);

export function MentorProfileProvider({ children, initialMentor }: { children: React.ReactNode, initialMentor: any }) {
  const [mentorData, setMentorData] = useState(initialMentor);
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: any }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [completionScore, setCompletionScore] = useState(initialMentor?.completionScore || 0);
  const [missingDetails, setMissingDetails] = useState<string[]>([]);

  // Recalculate completion and missing details whenever mentorData changes
  useEffect(() => {
    if (!mentorData) return;
    
    let score = 0;
    const missing: string[] = [];

    // Basic fields
    if (mentorData.user?.name || mentorData.name) score += 5;
    else missing.push("name");
    
    if (mentorData.headline) score += 10;
    else missing.push("headline");

    if (mentorData.bio) score += 10;
    else missing.push("bio");

    if (mentorData.image) score += 10;
    else missing.push("image");

    if (mentorData.resumeUrl) score += 10;
    else missing.push("resumeUrl");

    if (mentorData.user?.mobile || mentorData.mobile) score += 5;
    else missing.push("mobile");

    // Arrays
    if (mentorData.experiences && mentorData.experiences.length > 0) score += 15;
    else missing.push("experiences");

    if (mentorData.educations && mentorData.educations.length > 0) score += 15;
    else missing.push("educations");

    if (mentorData.projects && mentorData.projects.length > 0) score += 10;
    else missing.push("projects");

    if (mentorData.skills && mentorData.skills.length > 0) score += 10;
    else missing.push("skills");

    setCompletionScore(Math.min(100, score));
    setMissingDetails(missing);
  }, [mentorData]);

  const saveSection = async (field: string, data: any): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: data }),
      });
      if (!res.ok) throw new Error("Failed to save");
      
      const responseData = await res.json();
      if (responseData.mentor) {
        // Need to refetch or assume relation updates.
        // It's safer to use the client-side data to update arrays instantly for UX.
        setMentorData((prev: any) => ({ ...prev, ...responseData.mentor, [field]: data }));
      } else {
        setMentorData((prev: any) => ({ ...prev, [field]: data }));
      }
      
      // Remove from pending if it was there
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });

      toast.success("Profile Updated Successfully");
      
      // Auto-advance if this was triggered by the missing detail flow
      // We will let the event listener in SectionCards handle the auto-advance.

      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const globalSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info("No pending changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingChanges),
      });
      if (!res.ok) throw new Error("Failed to save");
      
      const responseData = await res.json();
      if (responseData.mentor) {
        setMentorData((prev: any) => ({ ...prev, ...responseData.mentor, ...pendingChanges }));
      } else {
        setMentorData((prev: any) => ({ ...prev, ...pendingChanges }));
      }

      setPendingChanges({});
      toast.success("All changes saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextMissingDetail = () => {
    if (missingDetails.length === 0) {
      toast.success("Your profile is 100% complete!");
      return;
    }

    const targetField = missingDetails[0];
    let elementId = targetField;

    // Map DB fields to HTML element IDs
    const mapping: Record<string, string> = {
      bio: "profile-summary",
      headline: "resume-headline",
      experiences: "experience",
      educations: "education",
      projects: "projects",
      skills: "key-skills",
      image: "profile-photo",
      resumeUrl: "resume",
      mobile: "contact-info"
    };

    if (mapping[targetField]) {
      elementId = mapping[targetField];
    }

    // Dispatch event to SectionCards or Header to open the edit form
    document.dispatchEvent(new CustomEvent('open-missing-detail', { detail: { target: elementId } }));
  };

  return (
    <MentorProfileContext.Provider value={{
      mentorData,
      setMentorData,
      completionScore,
      missingDetails,
      pendingChanges,
      setPendingChanges,
      saveSection,
      globalSave,
      handleNextMissingDetail,
      isSaving
    }}>
      {children}
    </MentorProfileContext.Provider>
  );
}

export function useMentorProfile() {
  const context = useContext(MentorProfileContext);
  if (context === undefined) {
    throw new Error("useMentorProfile must be used within a MentorProfileProvider");
  }
  return context;
}
