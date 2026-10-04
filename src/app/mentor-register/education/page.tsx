"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration, EducationEntry } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

export default function EducationPage() {
  const router = useRouter();
  const { data, updateData } = useMentorRegistration();
  
  const [educationList, setEducationList] = useState<EducationEntry[]>(
    data.education && data.education.length > 0
      ? data.education
      : [{ id: Date.now().toString(), highestQualification: "", specialization: "", college: "", passingYear: "", score: "" }]
  );

  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      { id: Date.now().toString(), highestQualification: "", specialization: "", college: "", passingYear: "", score: "" }
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter(edu => edu.id !== id));
    }
  };

  const handleChange = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationList(educationList.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleNext = () => {
    // Basic validation
    const isValid = educationList.every(edu => edu.highestQualification && edu.college && edu.passingYear);
    if (!isValid) {
      alert("Please fill in the required fields (Qualification, College, Passing Year).");
      return;
    }
    
    updateData({ education: educationList });
    router.push("/mentor-register/experience");
  };

  const handleBack = () => {
    updateData({ education: educationList });
    // Go back to the signup page where basic details are.
    // We should ideally open the signup tab with the mentor form open
    router.push("/signup?type=mentor");
  };

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={2} />
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Education</h1>
          <p className="text-slate-500">Tell us about your educational background.</p>
        </div>

        <div className="space-y-8">
          {educationList.map((edu, index) => (
            <div key={edu.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              {educationList.length > 1 && (
                <button 
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Highest Qualification *</Label>
                  <select 
                    value={edu.highestQualification}
                    onChange={(e) => handleChange(edu.id, "highestQualification", e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select highest qualification</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Specialization / Branch</Label>
                  <Input 
                    placeholder="Enter your specialization" 
                    value={edu.specialization}
                    onChange={(e) => handleChange(edu.id, "specialization", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>College / University *</Label>
                  <Input 
                    placeholder="Enter your college or university name" 
                    value={edu.college}
                    onChange={(e) => handleChange(edu.id, "college", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Passing Year *</Label>
                  <select 
                    value={edu.passingYear}
                    onChange={(e) => handleChange(edu.id, "passingYear", e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select passing year</option>
                    {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Score / Percentage / CGPA</Label>
                  <Input 
                    placeholder="Enter your score or percentage" 
                    value={edu.score}
                    onChange={(e) => handleChange(edu.id, "score", e.target.value)}
                    className="h-12 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddEducation}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl border-dashed h-12 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Education
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
