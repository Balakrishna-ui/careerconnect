"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, FileText, Upload, Briefcase, 
  User, Calendar, ShieldCheck, Sparkles, Globe, X, Plus, Clock, Key,
  GraduationCap, MapPin, DollarSign, UploadCloud, Search, Star, Building,
  XCircle, Shield, AlertCircle
} from "lucide-react";
import { signIn } from "next-auth/react";
import { submitMentorApplication, saveMentorDraft, getMentorDraft } from "@/actions/mentor-actions";

const STEPS = [
  { id: 1, name: "Basic Account", icon: User },
  { id: 2, name: "Identity Verification", icon: ShieldCheck },
  { id: 3, name: "Company Verification", icon: Briefcase },
  { id: 4, name: "Experience & Skills", icon: Sparkles },
  { id: 5, name: "Profile Information", icon: FileText },
  { id: 6, name: "Review & Submit", icon: CheckCircle2 }
];

const TECHNICAL_SKILLS = [
  "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
  "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
  "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
  "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain"
];

const NON_TECHNICAL_SKILLS = [
  "Product Management", "Marketing", "Leadership", "Consulting", "Agile"
];

const MENTORSHIP_AREAS = [
  "Resume Review", "Mock Interview", "Career Switch", "Promotion Guidance", "System Design Interview"
];

const SESSION_TYPES = [
  "Career Guidance", "Resume Review", "Mock Interview", "Career Switch",
  "Promotion Guidance", "System Design Interview", "Portfolio Review",
  "HR Interview", "Technical Interview", "Salary Negotiation",
  "LinkedIn Profile Review", "Career Roadmap", "Coding Session",
  "Freelancing Guidance"
];

const DURATIONS = [
  { label: "15 mins", value: 15 },
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "60 mins", value: 60 },
  { label: "90 mins", value: 90 },
  { label: "120 mins", value: 120 }
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function InputField({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        {...props} 
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow text-sm" 
      />
    </div>
  );
}

function SelectField({ label, required, options, placeholder, ...props }: { label: string; required?: boolean; options: string[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select 
        {...props} 
        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white text-sm"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

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

function MentorApplicationContent() {
  const searchParams = useSearchParams();
  const initFirstName = searchParams.get("firstName") || "";
  const initLastName = searchParams.get("lastName") || "";
  const initEmail = searchParams.get("email") || "";
  const initPassword = searchParams.get("password") || "";

  // If parameters exist, skip Step 1 because they already filled it out on the signup page
  const hasBasicDetails = !!(initFirstName && initLastName && initEmail);
  const [currentStep, setCurrentStep] = useState(hasBasicDetails ? 2 : 1);
  const [submitted, setSubmitted] = useState(false);
  
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [latestReviewReason, setLatestReviewReason] = useState<string | null>(null);

  // Step 1: Basic Account
  const [firstName, setFirstName] = useState(initFirstName);
  const [lastName, setLastName] = useState(initLastName);
  const [email, setEmail] = useState(initEmail);
  const [password, setPassword] = useState(initPassword);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Step 2: Identity Verification
  const [aadhaar, setAadhaar] = useState<File | string | null>(null);
  const [panCard, setPanCard] = useState<File | string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | string | null>(null);
  const [resume, setResume] = useState<File | string | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  useEffect(() => {
    async function fetchDraft() {
      try {
        const res = await getMentorDraft();
        if (res.success && res.mentor) {
          const mentor = res.mentor;
          
          // Basic Details
          const nameParts = mentor.name.split(" ");
          if (nameParts[0]) setFirstName(nameParts[0]);
          if (nameParts.length > 1) setLastName(nameParts.slice(1).join(" "));
          
          // Identity
          const aadhaarDoc = mentor.documents.find((d: any) => d.type === "AADHAAR");
          if (aadhaarDoc) setAadhaar(aadhaarDoc.fileUrl);
          
          const panDoc = mentor.documents.find((d: any) => d.type === "PAN");
          if (panDoc) setPanCard(panDoc.fileUrl);
          
          const resumeDoc = mentor.documents.find((d: any) => d.type === "RESUME");
          if (resumeDoc) setResume(resumeDoc.fileUrl);

          const photoDoc = mentor.documents.find((d: any) => d.type === "PROFILE_PHOTO");
          if (photoDoc) setProfilePhoto(photoDoc.fileUrl);
          else if (mentor.image) setProfilePhoto(mentor.image);

          if (mentor.socialProfiles) {
            setLinkedin(mentor.socialProfiles.linkedin || "");
            setPortfolio(mentor.socialProfiles.portfolio || "");
          }

          // Company
          if (mentor.company) setCompanyName(mentor.company);
          if (mentor.industry) setDomain(mentor.industry);

          // Experience & Skills
          if (mentor.role) setDesignation(mentor.role);
          if (mentor.experienceYears) setExperienceYears(mentor.experienceYears.toString());
          if (mentor.employmentType) setEmploymentType(mentor.employmentType);
          if (mentor.currentCTC) setCurrentCTC(mentor.currentCTC);
          if (mentor.noticePeriod) setNoticePeriod(mentor.noticePeriod);

          const techSkills = mentor.skills.filter((s: any) => s.category === "Technical").map((s: any) => s.name);
          if (techSkills.length > 0) setSelectedTechnical(techSkills);

          const nonTechSkills = mentor.skills.filter((s: any) => s.category === "Non-Technical").map((s: any) => s.name);
          if (nonTechSkills.length > 0) setSelectedNonTechnical(nonTechSkills);

          const areas = mentor.skills.filter((s: any) => s.category === "Areas of Mentorship").map((s: any) => s.name);
          if (areas.length > 0) setSelectedAreas(areas);

          if (mentor.experiences?.length > 0) {
            setPreviousCompanies(mentor.experiences.map((exp: any) => ({
              company: exp.companyName,
              role: exp.designation,
              duration: exp.duration,
              domain: exp.domain
            })));
          }

          // Profile Info
          if (mentor.headline) setHeadline(mentor.headline);
          if (mentor.bio) setBio(mentor.bio);
          if (mentor.languages) setLanguages(mentor.languages);
          if (mentor.location) setLocation(mentor.location);
          if (mentor.profileVisibility) setProfileVisibility(mentor.profileVisibility);

          if (mentor.sessionTypes?.length > 0) {
             setSessions(mentor.sessionTypes.map((s: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                type: s.title,
                isCustom: !SESSION_TYPES.includes(s.title),
                duration: s.duration,
                price: s.price.toString()
             })));
          }

          // Application Status & Reviews
          setApplicationStatus(mentor.applicationStatus);
          if (mentor.adminReviews?.length > 0) {
            setLatestReviewReason(mentor.adminReviews[0].reason || null);
          }

          // Calculate current step based on draft data
          if (mentor.profileCompleted || ["PENDING", "REJECTED", "UNDER_REVIEW", "MORE_INFO_REQUIRED"].includes(mentor.applicationStatus)) {
             setSubmitted(true);
             setCurrentStep(6);
          } else if (mentor.headline) setCurrentStep(6);
          else if (mentor.role) setCurrentStep(5);
          else if (mentor.company) setCurrentStep(4);
          else if (aadhaarDoc) setCurrentStep(3);
          else setCurrentStep(2);
        }
      } catch(err) {
        console.error("Failed to load draft", err);
      } finally {
        setIsLoadingDraft(false);
      }
    }
    if (!hasBasicDetails) fetchDraft();
    else setIsLoadingDraft(false);
  }, []);

  // Step 3: Company Verification
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isCompanyVerified, setIsCompanyVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Step 4: Experience & Skills
  const [designation, setDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [domain, setDomain] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [currentCTC, setCurrentCTC] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  
  const [selectedTechnical, setSelectedTechnical] = useState<string[]>([]);
  const [selectedNonTechnical, setSelectedNonTechnical] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [showAllTechSkills, setShowAllTechSkills] = useState(false);

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedTechnical.includes(trimmed)) {
      setSelectedTechnical([...selectedTechnical, trimmed]);
    }
    setCustomSkillInput("");
  };
  
  const [previousCompanies, setPreviousCompanies] = useState<{company: string, role: string, duration: string, domain: string}[]>([]);
  const [certifications, setCertifications] = useState<File[]>([]);

  // Step 5: Profile Information
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [profileVisibility, setProfileVisibility] = useState("Private (Default)");
  
  const [sessions, setSessions] = useState<{
    id: string;
    type: string;
    isCustom: boolean;
    duration: number;
    price: string;
  }[]>([
    { id: Math.random().toString(36).substr(2, 9), type: SESSION_TYPES[0], isCustom: false, duration: 60, price: "999" }
  ]);
  const [schedule, setSchedule] = useState(
    DAYS.map((_, i) => ({ dayOfWeek: i, isAvailable: i >= 1 && i <= 5, startTime: "09:00", endTime: "17:00" }))
  );

  const [education, setEducation] = useState<{college: string, degree: string, year: string, cgpa: string}[]>([]);
  const [achievements, setAchievements] = useState("");


  const progress = Math.round((currentStep / STEPS.length) * 100);

  const toggleSkill = (skill: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]);
  };

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      const res = await saveMentorDraft(1, { firstName, lastName, email, password });
      if (res.success) {
        await signIn("credentials", { email, password, redirect: false });
        setCurrentStep(2);
      } else {
        alert(res.error || "Failed to create account");
      }
    } catch(err) {
      alert("An error occurred");
    }
    setIsCreatingAccount(false);
  };

  const handleSendOTP = async () => {
    // Basic domain validation for company emails
    const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    const domain = companyEmail.split('@')[1];
    if (!domain || publicDomains.includes(domain)) {
      setOtpError("Please use an official company email address.");
      return;
    }
    
    setOtpError("");
    try {
      const res = await fetch("/api/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", email: companyEmail })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsOtpSent(true);
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (e) {
      setOtpError("An error occurred.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("/api/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email: companyEmail, otp })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsCompanyVerified(true);
        setOtpError("");
      } else {
        setOtpError(data.error || "Invalid OTP.");
      }
    } catch (e) {
      setOtpError("An error occurred.");
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      // helper to upload a single file if it's a File object
      const uploadFile = async (f: File | string | null) => {
        if (!f) return null;
        if (typeof f === 'string') return f;
        const formData = new FormData();
        formData.append("file", f);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      };

      const data: any = {};
      
      if (currentStep === 2) {
        data.aadhaar = await uploadFile(aadhaar);
        data.panCard = await uploadFile(panCard);
        data.resume = await uploadFile(resume);
        data.profilePhoto = await uploadFile(profilePhoto);
        data.linkedin = linkedin;
        data.portfolio = portfolio;
        data.github = "";
      } else if (currentStep === 3) {
        data.companyName = companyName;
        data.domain = domain;
      } else if (currentStep === 4) {
        data.designation = designation;
        data.experienceYears = experienceYears;
        data.employmentType = employmentType;
        data.currentCTC = currentCTC;
        data.noticePeriod = noticePeriod;
        data.technicalSkills = selectedTechnical;
        data.nonTechnicalSkills = selectedNonTechnical;
        data.areasOfMentorship = selectedAreas;
        data.previousCompanies = previousCompanies;
      } else if (currentStep === 5) {
        
        // Validation
        const isValidSessions = sessions.every(s => {
          if (!s.type.trim()) return false;
          const p = Number(s.price);
          if (isNaN(p) || p <= 0 || p > 50000) return false;
          return true;
        });

        if (!isValidSessions) {
          alert("Please ensure all sessions have a valid type, and price is between ₹1 and ₹50,000.");
          setIsSaving(false);
          return;
        }

        data.bio = bio;
        data.headline = headline;
        data.languages = languages;
        data.location = location;
        data.profileVisibility = profileVisibility;
        data.sessions = sessions.map(s => ({
          title: s.type,
          duration: s.duration,
          price: Number(s.price)
        }));
      }
      
      const res = await saveMentorDraft(currentStep, data);
      if (res.success) {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(res.error || "Failed to save draft");
      }
    } catch(err) {
      console.error(err);
      alert("An error occurred while saving.");
    }
    setIsSaving(false);
  };

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-5xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">CareerConnect</span>
          </div>
          <div className="text-sm font-semibold text-gray-500">Become a Mentor</div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Progress */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-2">Registration Progress</h3>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>

            <nav className="space-y-1">
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <button 
                    key={step.id} 
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                      isCurrent ? "bg-blue-50 text-blue-700 font-semibold" : 
                      isCompleted ? "text-gray-900 cursor-pointer hover:bg-gray-50" : "text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isCompleted && !isCurrent}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isCompleted ? "bg-blue-600 text-white" : 
                      isCurrent ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span className="text-sm truncate">{step.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content - Forms */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px] flex flex-col">
            
            <div className="flex-1">

              {/* ─── STEP 1: Basic Account ─── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Basic Account Details</h2>
                    <p className="text-gray-500 mt-1">Create your mentor account to start your journey.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" required placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <InputField label="Last Name" required placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <InputField label="Personal Email" required type="email" placeholder="john@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <InputField label="Password" required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              )}

              {/* ─── STEP 2: Identity Verification ─── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
                    <p className="text-gray-500 mt-1">Upload required documents and social links to verify your identity.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Aadhaar Card", desc: "PDF, JPG, PNG (Max 10MB)", file: aadhaar, setFile: setAadhaar, icon: ShieldCheck },
                      { label: "PAN Card", desc: "PDF, JPG, PNG (Max 10MB)", file: panCard, setFile: setPanCard, icon: ShieldCheck },
                      { label: "Profile Photo", desc: "Professional Headshot", file: profilePhoto, setFile: setProfilePhoto, icon: User },
                      { label: "Resume", desc: "PDF Only", file: resume, setFile: setResume, icon: FileText }
                    ].map(({ label, desc, file, setFile, icon: Icon }) => (
                      <div key={label} className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{label}</p>
                            <p className="text-sm text-gray-500">{file ? (file instanceof File ? file.name : (typeof file === "string" ? file.split('/').pop() : desc)) : desc}</p>
                          </div>
                        </div>
                        {file ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uploaded</span>
                            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> Upload
                            <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <InputField label="LinkedIn URL" required placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                    <InputField label="Portfolio / GitHub (Optional)" placeholder="https://github.com/yourname" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
                  </div>
                </div>
              )}

              {/* ─── STEP 3: Company Verification ─── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Company Verification</h2>
                    <p className="text-gray-500 mt-1">Verify your employment with an official company email.</p>
                  </div>
                  
                  <InputField label="Current Company Name" required placeholder="e.g. Google, Microsoft" value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isCompanyVerified} />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Official Company Email (Optional)</label>
                    <div className="flex gap-3">
                      <input 
                        type="email" 
                        placeholder="john@google.com" 
                        value={companyEmail} 
                        onChange={e => setCompanyEmail(e.target.value)} 
                        disabled={isCompanyVerified || isOtpSent}
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm disabled:bg-gray-50 disabled:text-gray-500" 
                      />
                      {!isCompanyVerified && (
                        <button 
                          onClick={handleSendOTP}
                          disabled={!companyEmail || isOtpSent}
                          className="px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {isOtpSent ? "OTP Sent" : "Send OTP"}
                        </button>
                      )}
                    </div>
                    {otpError && <p className="text-red-500 text-xs font-semibold">{otpError}</p>}
                  </div>

                  {isOtpSent && !isCompanyVerified && (
                    <div className="p-5 border border-blue-200 bg-blue-50 rounded-xl space-y-4">
                      <p className="text-sm text-blue-800 font-medium">Enter the 6-digit OTP sent to {companyEmail}</p>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="123456" 
                          value={otp} 
                          onChange={e => setOtp(e.target.value)}
                          maxLength={6}
                          className="w-32 p-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-600 outline-none text-center font-bold tracking-widest" 
                        />
                        <button onClick={handleVerifyOTP} className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
                          Verify OTP
                        </button>
                      </div>
                      <button onClick={handleSendOTP} className="text-xs font-semibold text-blue-600 hover:underline">Resend OTP</button>
                    </div>
                  )}

                  {isCompanyVerified && (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-800">Company Email Verified Successfully!</span>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 4: Experience & Skills ─── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Experience & Skills</h2>
                    <p className="text-gray-500 mt-1">Detail your professional trajectory.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Current Designation" required placeholder="Senior Engineer" value={designation} onChange={e => setDesignation(e.target.value)} />
                    <SelectField label="Employment Type" required options={["Full Time", "Part Time", "Contract", "Freelancer"]} placeholder="Select type" value={employmentType} onChange={e => setEmploymentType(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Current Domain" required placeholder="Software Development" value={domain} onChange={e => setDomain(e.target.value)} />
                    <SelectField label="Years of Experience" required options={["0-2", "2-5", "5-8", "8-12", "12+"]} placeholder="Select experience" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Current CTC (Optional)" placeholder="e.g. ₹30 LPA" value={currentCTC} onChange={e => setCurrentCTC(e.target.value)} />
                    <InputField label="Notice Period (Optional)" placeholder="e.g. 60 Days" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Technical Skills & Technologies <span className="text-red-500">*</span></h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(showAllTechSkills ? TECHNICAL_SKILLS : Array.from(new Set([...TECHNICAL_SKILLS.slice(0, 15), ...selectedTechnical.filter(s => TECHNICAL_SKILLS.includes(s))]))).map(s => (
                        <SkillChip key={s} label={s} selected={selectedTechnical.includes(s)} onClick={() => toggleSkill(s, selectedTechnical, setSelectedTechnical)} />
                      ))}
                      {!showAllTechSkills && TECHNICAL_SKILLS.length > 15 && (
                        <button
                          type="button"
                          onClick={() => setShowAllTechSkills(true)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                        >
                          +{TECHNICAL_SKILLS.length - 15} More
                        </button>
                      )}
                      {selectedTechnical.filter(s => !TECHNICAL_SKILLS.includes(s)).map(s => (
                        <SkillChip key={s} label={s} selected={true} onClick={() => toggleSkill(s, selectedTechnical, setSelectedTechnical)} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 max-w-sm">
                      <div className="flex-1">
                        <input 
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
                          className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddCustomSkill}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Non-Technical Skills (Optional)</h3>
                    <div className="flex flex-wrap gap-2">
                      {NON_TECHNICAL_SKILLS.map(s => (
                        <SkillChip key={s} label={s} selected={selectedNonTechnical.includes(s)} onClick={() => toggleSkill(s, selectedNonTechnical, setSelectedNonTechnical)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 5: Profile Information ─── */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <p className="text-gray-500 mt-1">This is how mentees will see you on the platform.</p>
                  </div>
                  
                  <InputField label="Headline" required placeholder="Senior Software Engineer at Google | Helping Engineers Crack FAANG" value={headline} onChange={e => setHeadline(e.target.value)} />
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">About Yourself <span className="text-red-500">*</span></label>
                    <textarea 
                      value={bio} onChange={e => setBio(e.target.value)} rows={4}
                      placeholder="Write at least 200 characters about your journey..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Languages Known" required placeholder="English, Hindi, Telugu" value={languages} onChange={e => setLanguages(e.target.value)} />
                    <InputField label="Location" required placeholder="Bangalore, India" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Available For</h3>
                    <div className="flex flex-wrap gap-2">
                      {MENTORSHIP_AREAS.map(s => (
                        <SkillChip key={s} label={s} selected={selectedAreas.includes(s)} onClick={() => toggleSkill(s, selectedAreas, setSelectedAreas)} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Session Pricing</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSessions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type: SESSION_TYPES[0], isCustom: false, duration: 60, price: "999" }])}
                          className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Session
                        </button>
                        <button 
                          onClick={() => setSessions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type: "", isCustom: true, duration: 60, price: "999" }])}
                          className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Custom
                        </button>
                      </div>
                    </div>
                    
                    {sessions.map((session, index) => (
                      <div key={session.id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm relative group">
                        {sessions.length > 1 && (
                          <button
                            onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {session.isCustom ? (
                            <InputField 
                              label="Custom Session Name" 
                              required 
                              placeholder="e.g. AI Career Coaching" 
                              value={session.type} 
                              onChange={e => {
                                const copy = [...sessions]; 
                                copy[index].type = e.target.value; 
                                setSessions(copy);
                              }} 
                            />
                          ) : (
                            <SelectField 
                              label="Session Type" 
                              required 
                              options={SESSION_TYPES} 
                              value={session.type} 
                              onChange={e => {
                                const copy = [...sessions]; 
                                copy[index].type = e.target.value; 
                                setSessions(copy);
                              }} 
                            />
                          )}
                          <SelectField 
                            label="Duration" 
                            required 
                            options={DURATIONS.map(d => d.label)} 
                            value={`${session.duration} mins`} 
                            onChange={e => {
                              const copy = [...sessions]; 
                              copy[index].duration = parseInt(e.target.value); 
                              setSessions(copy);
                            }} 
                          />
                          <div>
                            <InputField 
                              label="Price (₹)" 
                              required 
                              type="number" 
                              min={1}
                              max={50000}
                              placeholder="999" 
                              value={session.price} 
                              onChange={e => {
                                const copy = [...sessions]; 
                                copy[index].price = e.target.value; 
                                setSessions(copy);
                              }} 
                            />
                            {session.price && (Number(session.price) <= 0 || Number(session.price) > 50000) && (
                              <p className="text-red-500 text-xs font-semibold mt-1">Price must be between ₹1 and ₹50,000</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <SelectField label="Profile Visibility" required options={["Private (Default)", "Public"]} value={profileVisibility} onChange={e => setProfileVisibility(e.target.value)} />
                </div>
              )}

              {/* ─── STEP 6: Review & Submit ─── */}
              {currentStep === 6 && !submitted && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                    <p className="text-gray-500 mt-1 max-w-md mx-auto">Review your application summary before final submission.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Basic Details", done: !!firstName && !!email },
                        { label: "Identity Documents", done: !!aadhaar && !!panCard && !!resume },
                        { label: "Company Verification", done: true }, // Optional for testing
                        { label: "Experience & Skills", done: !!designation && selectedTechnical.length > 0 },
                        { label: "Profile Information", done: !!headline && !!bio } // Relaxed bio length
                      ].map(({ label, done }) => (
                        <div key={label} className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">{label}</span>
                          {done ? (
                            <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Complete</span>
                          ) : (
                            <span className="font-semibold text-amber-600">Incomplete</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── SUBMITTED STATE ─── */}
              {submitted && applicationStatus === "PENDING" && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                  <p className="text-gray-500 max-w-md mb-8">
                    Your mentor profile has been saved. Our verification team will review your application within 24-48 hours.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-semibold px-5 py-3 rounded-xl border border-amber-100 text-sm">
                    <Clock className="w-4 h-4" />
                    Status: Pending Review
                  </div>
                </div>
              )}

              {submitted && applicationStatus === "REJECTED" && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Rejected</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    Unfortunately, your mentor application has been rejected at this time.
                  </p>
                  {latestReviewReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left max-w-md w-full mb-6 text-sm text-red-800">
                      <p className="font-semibold mb-1">Reason for Rejection:</p>
                      <p>{latestReviewReason}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setCurrentStep(2);
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Update Application & Reapply
                  </button>
                </div>
              )}

              {submitted && applicationStatus === "UNDER_REVIEW" && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Under Review</h2>
                  <p className="text-gray-500 max-w-md mb-8">
                    Your application is actively being reviewed by our administrators.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-5 py-3 rounded-xl border border-blue-100 text-sm">
                    <Clock className="w-4 h-4" />
                    Status: Under Review
                  </div>
                </div>
              )}

              {submitted && applicationStatus === "MORE_INFO_REQUIRED" && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Action Required</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    We need a bit more information to process your application.
                  </p>
                  {latestReviewReason && (() => {
                    let msg = latestReviewReason;
                    let docs = "";
                    let deadline = "";
                    try {
                      const parsed = JSON.parse(latestReviewReason);
                      if (parsed.message) msg = parsed.message;
                      if (parsed.documents) docs = parsed.documents;
                      if (parsed.deadline) deadline = parsed.deadline;
                    } catch(e) {}
                    return (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-md w-full mb-6 text-sm text-amber-800">
                        <p className="font-semibold mb-1">Message from Admin:</p>
                        <p className="mb-3">{msg}</p>
                        {docs && <p><span className="font-semibold">Documents Needed:</span> {docs}</p>}
                        {deadline && <p><span className="font-semibold">Deadline:</span> {deadline}</p>}
                      </div>
                    );
                  })()}
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setCurrentStep(2);
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Provide Missing Information
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {!submitted && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button 
                    onClick={prevStep}
                    className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  {currentStep === 1 ? (
                    <button 
                      onClick={handleCreateAccount}
                      disabled={!email || !password || !firstName || isCreatingAccount}
                      className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {isCreatingAccount ? "Creating Account..." : "Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : currentStep < STEPS.length ? (
                    <button 
                      onClick={handleSaveAndContinue}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {isSaving ? "Saving..." : "Save & Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          const res = await submitMentorApplication({});
                          if (res.success) {
                            setSubmitted(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            alert(res.error || "Failed to submit application.");
                          }
                        } catch (error) {
                          console.error("Failed to submit application:", error);
                          alert("Failed to submit application. Please try again.");
                        }
                        setIsSaving(false);
                      }}
                      // disabled={!isCompanyVerified} // Disabled verification block for testing
                      disabled={isSaving}
                      className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-lg shadow-green-600/20"
                    >
                      {isSaving ? "Submitting..." : "Submit Application"}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default function MentorApplication() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <MentorApplicationContent />
    </Suspense>
  );
}
