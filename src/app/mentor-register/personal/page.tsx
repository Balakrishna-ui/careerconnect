"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PersonalPage() {
  const router = useRouter();
  const { data, updateData } = useMentorRegistration();
  
  const [gender, setGender] = useState(data.gender || "");
  const [dob, setDob] = useState(data.dob || "");
  const [country, setCountry] = useState(data.country || "");
  const [linkedin, setLinkedin] = useState(data.linkedin || "");

  const handleNext = () => {
    if (!gender || !dob || !country) {
      alert("Please fill in the required fields (Gender, Date of Birth, Country).");
      return;
    }
    
    updateData({ gender, dob, country, linkedin });
    router.push("/mentor-register/expertise");
  };

  const handleBack = () => {
    updateData({ gender, dob, country, linkedin });
    router.push("/mentor-register/experience");
  };

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={4} />
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Personal Details</h1>
          <p className="text-slate-500">Provide some basic details to personalize your profile.</p>
        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-12 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input 
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-12 rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Country *</Label>
                <Input 
                  placeholder="e.g. United States, India" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-12 rounded-xl bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label>LinkedIn Profile</Label>
                <div className="relative">
                  <Input 
                    placeholder="https://linkedin.com/in/username" 
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="h-12 px-6 rounded-xl border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
