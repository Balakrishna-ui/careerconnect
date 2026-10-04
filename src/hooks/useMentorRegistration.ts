import { useState, useEffect } from 'react';

export type EducationEntry = {
  id: string; // for React keys
  highestQualification: string;
  specialization: string;
  college: string;
  passingYear: string;
  score: string;
};

export type ExperienceEntry = {
  id: string;
  jobTitle: string;
  company: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
};

export type MentorRegistrationData = {
  // Step 1: Basic
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  
  // Step 2: Education
  education?: EducationEntry[];
  
  // Step 3: Experience
  experience?: ExperienceEntry[];

  // Step 4: Personal
  gender?: string;
  dob?: string;
  country?: string;
  linkedin?: string;

  // Step 5: Expertise
  designation?: string;
  company?: string;
  industry?: string;
  skills?: string[];

  // Step 6: Offerings
  sessions?: any[];
  schedule?: any[];
  
  // Step 7: Profile
  image?: string;
  bio?: string;
};

const STORAGE_KEY = 'mentor_registration_data';

export function useMentorRegistration() {
  // Initialize state from sessionStorage if available, otherwise empty object
  const [data, setData] = useState<MentorRegistrationData>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse mentor registration data", e);
        }
      }
    }
    return {};
  });

  // Whenever data changes, sync it to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const updateData = (newData: Partial<MentorRegistrationData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const clearData = () => {
    setData({});
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    data,
    updateData,
    clearData
  };
}
