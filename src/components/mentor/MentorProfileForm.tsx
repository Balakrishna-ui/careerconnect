"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TECHNICAL_SKILLS = [
  "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
  "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
  "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
  "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain"
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
      {selected && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}

export function MentorProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    company: "",
    role: "",
    industry: "",
    experienceYears: 0,
    location: "",
    languages: "",
  });

  const [selectedTechnical, setSelectedTechnical] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedTechnical.includes(trimmed)) {
      setSelectedTechnical([...selectedTechnical, trimmed]);
    }
    setCustomSkillInput("");
  };

  const toggleSkill = (skill: string) => {
    if (selectedTechnical.includes(skill)) {
      setSelectedTechnical(selectedTechnical.filter(s => s !== skill));
    } else {
      setSelectedTechnical([...selectedTechnical, skill]);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/mentor/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.mentor) {
            setFormData({
              name: data.mentor.name || "",
              headline: data.mentor.headline || "",
              bio: data.mentor.bio || "",
              company: data.mentor.company || "",
              role: data.mentor.role || "",
              industry: data.mentor.industry || "",
              experienceYears: data.mentor.experienceYears || 0,
              location: data.mentor.location || "",
              languages: data.mentor.languages || "",
            });
            if (data.mentor.skills) {
              const techSkills = data.mentor.skills
                .filter((s: any) => s.category === "Technical")
                .map((s: any) => s.name);
              setSelectedTechnical(techSkills);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experienceYears" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          technicalSkills: selectedTechnical,
        }),
      });
      
      if (res.ok) {
        setMessage("Profile updated successfully!");
        router.refresh();
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Profile Management</CardTitle>
        <CardDescription>Update your personal and professional information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          {message && (
            <div className={`p-3 text-sm rounded-md ${message.includes("success") ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Software Engineer at Google" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">About (Bio)</Label>
            <Textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Current Company</Label>
              <Input id="company" name="company" value={formData.company} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Designation</Label>
              <Input id="role" name="role" value={formData.role} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input id="experienceYears" name="experienceYears" type="number" min={0} value={formData.experienceYears} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languages">Languages (Comma separated)</Label>
              <Input id="languages" name="languages" value={formData.languages} onChange={handleChange} placeholder="e.g. English, Spanish" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Skills & Technologies</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {TECHNICAL_SKILLS.map(s => (
                <SkillChip key={s} label={s} selected={selectedTechnical.includes(s)} onClick={() => toggleSkill(s)} />
              ))}
              {selectedTechnical.filter(s => !TECHNICAL_SKILLS.includes(s)).map(s => (
                <SkillChip key={s} label={s} selected={true} onClick={() => toggleSkill(s)} />
              ))}
            </div>
            <div className="flex items-center gap-2 max-w-sm">
              <div className="flex-1">
                <Input 
                  type="text"
                  placeholder="Type other technology..." 
                  value={customSkillInput} 
                  onChange={e => setCustomSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                />
              </div>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleAddCustomSkill}
              >
                Add
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full md:w-auto mt-4">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
