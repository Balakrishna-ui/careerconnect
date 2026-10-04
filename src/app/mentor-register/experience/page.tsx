"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration, ExperienceEntry } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

export default function ExperiencePage() {
  const router = useRouter();
  const { data, updateData } = useMentorRegistration();
  
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>(
    data.experience && data.experience.length > 0
      ? data.experience
      : [{ id: Date.now().toString(), jobTitle: "", company: "", employmentType: "", startDate: "", endDate: "", isCurrent: false, description: "" }]
  );

  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      { id: Date.now().toString(), jobTitle: "", company: "", employmentType: "", startDate: "", endDate: "", isCurrent: false, description: "" }
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    if (experienceList.length > 1) {
      setExperienceList(experienceList.filter(exp => exp.id !== id));
    }
  };

  const handleChange = (id: string, field: keyof ExperienceEntry, value: any) => {
    setExperienceList(experienceList.map(exp => {
      if (exp.id === id) {
        if (field === "isCurrent" && value === true) {
          return { ...exp, [field]: value, endDate: "" };
        }
        return { ...exp, [field]: value };
      }
      return exp;
    }));
  };

  const handleNext = () => {
    // Basic validation
    const isValid = experienceList.every(exp => exp.jobTitle && exp.company && exp.startDate && (exp.isCurrent || exp.endDate));
    if (!isValid) {
      alert("Please fill in the required fields (Job Title, Company, Start Date, End Date).");
      return;
    }
    
    updateData({ experience: experienceList });
    router.push("/mentor-register/personal");
  };

  const handleBack = () => {
    updateData({ experience: experienceList });
    router.push("/mentor-register/education");
  };

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={3} />
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Work Experience</h1>
          <p className="text-slate-500">Tell us about your professional experience.</p>
        </div>

        <div className="space-y-8">
          {experienceList.map((exp) => (
            <div key={exp.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              {experienceList.length > 1 && (
                <button 
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input 
                    placeholder="Enter your job title" 
                    value={exp.jobTitle}
                    onChange={(e) => handleChange(exp.id, "jobTitle", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    placeholder="Enter company name" 
                    value={exp.company}
                    onChange={(e) => handleChange(exp.id, "company", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Employment Type</Label>
                  <select 
                    value={exp.employmentType}
                    onChange={(e) => handleChange(exp.id, "employmentType", e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select employment type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input 
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => handleChange(exp.id, "startDate", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input 
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => handleChange(exp.id, "endDate", e.target.value)}
                    disabled={exp.isCurrent}
                    className="h-12 rounded-xl bg-white disabled:opacity-50"
                  />
                  <div className="flex items-center gap-2 mt-2 pt-1">
                    <input 
                      type="checkbox" 
                      id={`current-${exp.id}`}
                      checked={exp.isCurrent}
                      onChange={(e) => handleChange(exp.id, "isCurrent", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`current-${exp.id}`} className="text-xs text-slate-600 font-normal cursor-pointer">
                      Currently Working Here
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Job Description</Label>
                  <Textarea 
                    placeholder="Describe your role and responsibilities" 
                    value={exp.description}
                    onChange={(e) => handleChange(exp.id, "description", e.target.value)}
                    className="rounded-xl bg-white min-h-[120px] resize-none"
                    maxLength={1000}
                  />
                  <p className="text-[10px] text-right text-slate-400">{exp.description.length}/1000</p>
                </div>
              </div>
            </div>
          ))}

          <div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddExperience}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl border-dashed h-12 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Experience
            </Button>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={handleBack} className="rounded-xl h-12 px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white">
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
