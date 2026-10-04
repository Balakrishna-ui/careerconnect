"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const ALL_SKILLS = [
  "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
  "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
  "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
  "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain",
  "Product Management", "Marketing", "Leadership", "Consulting",
  "Resume Review", "Mock Interview", "Career Switch", "Promotion Guidance", "System Design Interview"
];

function SkillChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {label}
    </button>
  );
}

export default function ExpertisePage() {
  const router = useRouter();
  const { data, updateData } = useMentorRegistration();
  
  const [designation, setDesignation] = useState(data.designation || "");
  const [company, setCompany] = useState(data.company || "");
  const [industry, setIndustry] = useState(data.industry || "");
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (!designation || !company || !industry) {
      alert("Please fill in the required professional details (Designation, Company, Industry).");
      return;
    }
    if (skills.length < 3) {
      alert("Please select at least 3 skills to showcase your expertise.");
      return;
    }
    
    updateData({ designation, company, industry, skills });
    router.push("/mentor-register/offerings");
  };

  const handleBack = () => {
    updateData({ designation, company, industry, skills });
    router.push("/mentor-register/personal");
  };

  const filteredSkills = ALL_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={5} />
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Professional Expertise</h1>
          <p className="text-slate-500">Tell us about your current role and key skills.</p>
        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Current Designation / Role *</Label>
                <Input 
                  placeholder="e.g. Senior Software Engineer" 
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-12 rounded-xl bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Current Company *</Label>
                <Input 
                  placeholder="e.g. Google" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-12 rounded-xl bg-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Industry *</Label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-12 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">Select Industry</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Skills & Expertise *</Label>
                <p className="text-sm text-slate-500 mb-2">Select at least 3 skills you can mentor others in.</p>
                <Input 
                  placeholder="Search skills..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl bg-white mb-4"
                />
              </div>

              {skills.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wider">Selected Skills ({skills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium flex items-center gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer hover:text-blue-200" onClick={() => toggleSkill(skill)} />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto p-1">
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map(skill => (
                    <SkillChip 
                      key={skill} 
                      label={skill} 
                      selected={skills.includes(skill)}
                      onClick={() => toggleSkill(skill)}
                    />
                  ))}
                  {filteredSkills.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No skills found matching "{searchQuery}"</p>
                  )}
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
