"use client";

import { useState } from "react";
import { 
  CheckCircle2, ChevronRight, ChevronLeft, FileText, Upload, Briefcase, 
  User, Calendar, ShieldCheck, Sparkles, Globe, X, Plus, Clock 
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Account Details", icon: User },
  { id: 2, name: "Personal Info", icon: User },
  { id: 3, name: "Professional", icon: Briefcase },
  { id: 4, name: "Expertise", icon: Sparkles },
  { id: 5, name: "About", icon: FileText },
  { id: 6, name: "Sessions", icon: Calendar },
  { id: 7, name: "Schedule", icon: Clock },
  { id: 8, name: "Social & Links", icon: Globe },
  { id: 9, name: "Verification", icon: Upload },
  { id: 10, name: "Review", icon: CheckCircle2 }
];

const TECHNICAL_SKILLS = [
  "React", "Node.js", "Python", "Java", "TypeScript", "AWS", "GCP", "Azure",
  "Machine Learning", "SQL", "MongoDB", "System Design", "Docker", "Kubernetes",
  "Next.js", "Vue.js", "Angular", "Go", "Rust", "C++", "SAP", "Power BI",
  "REST APIs", "GraphQL", "Microservices", "Redis", "ElasticSearch"
];

const NON_TECHNICAL_SKILLS = [
  "Product Management", "Marketing", "Leadership", "Consulting",
  "Agile", "Figma", "User Research", "Product Analytics",
  "Business Analysis", "Project Management", "Scrum", "Data Analytics"
];

const MENTORSHIP_AREAS = [
  "Resume Review", "Mock Interview", "Career Switch", "Promotion Guidance",
  "Salary Negotiation", "Leadership Coaching", "MBA Guidance", "Study Abroad",
  "Portfolio Review", "Technical Interview", "System Design Interview"
];

const SESSION_TYPES = [
  "Career Guidance", "Resume Review", "Mock Interview", "Leadership Coaching", "Technical Mentoring"
];

const DURATIONS = [
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "60 mins", value: 60 },
  { label: "90 mins", value: 90 }
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

export default function MentorApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Personal
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);

  // Step 3: Professional
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [careerLevel, setCareerLevel] = useState("");

  // Step 4: Expertise
  const [selectedTechnical, setSelectedTechnical] = useState<string[]>([]);
  const [selectedNonTechnical, setSelectedNonTechnical] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Step 5: About
  const [bio, setBio] = useState("");
  const [highlights, setHighlights] = useState("");

  // Step 6: Sessions
  const [sessions, setSessions] = useState<{type: string; duration: number; price: string; freeDiscovery: boolean}[]>([
    { type: SESSION_TYPES[0], duration: 60, price: "999", freeDiscovery: false }
  ]);

  // Step 7: Schedule
  const [schedule, setSchedule] = useState(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      isAvailable: i >= 1 && i <= 5,
      startTime: "09:00",
      endTime: "17:00"
    }))
  );

  // Step 8: Social
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");

  // Step 9: Documents
  const [employeeId, setEmployeeId] = useState<File | null>(null);
  const [govtId, setGovtId] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [companyEmail, setCompanyEmail] = useState("");

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const progress = Math.round((currentStep / STEPS.length) * 100);

  const toggleSkill = (skill: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]);
  };

  const totalExpertise = selectedTechnical.length + selectedNonTechnical.length + selectedAreas.length;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-5xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">CareerConnect</span>
          </div>
          <div className="text-sm font-semibold text-gray-500">
            Mentor Application
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Progress */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-2">Profile Completion</h3>
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
                      if (isCompleted) setCurrentStep(step.id);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                      isCurrent ? "bg-blue-50 text-blue-700 font-semibold" : 
                      isCompleted ? "text-gray-900 hover:bg-gray-50 cursor-pointer" : "text-gray-400 cursor-default"
                    }`}
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

              {/* ─── STEP 1: Account Details ─── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                    <p className="text-gray-500 mt-1">Let&apos;s start with your basic information to set up your mentor profile.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" required placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <InputField label="Last Name" required placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <InputField label="Email Address" required type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <InputField label="Mobile Number" required type="tel" placeholder="+91 98765 43210" value={mobile} onChange={e => setMobile(e.target.value)} />
                  <InputField label="Password" required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              )}

              {/* ─── STEP 2: Personal Information ─── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-500 mt-1">Tell us a bit more about yourself.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 shrink-0">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">Upload Photo</button>
                      <p className="text-xs text-gray-400 mt-2">Recommended: 400×400px, Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Gender" required options={["Male", "Female", "Non-binary", "Prefer not to say"]} placeholder="Select gender" value={gender} onChange={e => setGender(e.target.value)} />
                    <InputField label="Date of Birth" required type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField label="Country" required placeholder="India" value={country} onChange={e => setCountry(e.target.value)} />
                    <InputField label="State" placeholder="Karnataka" value={state} onChange={e => setState(e.target.value)} />
                    <InputField label="City" placeholder="Bangalore" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <SelectField label="Timezone" required options={["IST (UTC+5:30)", "EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)", "CET (UTC+1)", "JST (UTC+9)"]} placeholder="Select timezone" value={timezone} onChange={e => setTimezone(e.target.value)} />
                </div>
              )}

              {/* ─── STEP 3: Professional Information ─── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                    <p className="text-gray-500 mt-1">Help us understand your professional background.</p>
                  </div>
                  <InputField label="Current Designation" required placeholder="e.g. Senior Software Engineer" value={designation} onChange={e => setDesignation(e.target.value)} />
                  <InputField label="Current Company" required placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Employment Type" required options={["Full Time", "Contractor", "Freelancer"]} placeholder="Select type" value={employmentType} onChange={e => setEmploymentType(e.target.value)} />
                    <InputField label="Total Experience" required placeholder="e.g. 8 Years" value={totalExperience} onChange={e => setTotalExperience(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Industry" required options={["Software", "Product", "Consulting", "Finance", "Healthcare", "E-Commerce", "EdTech", "FinTech"]} placeholder="Select industry" value={industry} onChange={e => setIndustry(e.target.value)} />
                    <SelectField label="Career Level" required options={["Associate", "Mid Level", "Senior", "Lead", "Director", "VP", "C-Level"]} placeholder="Select level" value={careerLevel} onChange={e => setCareerLevel(e.target.value)} />
                  </div>
                </div>
              )}

              {/* ─── STEP 4: Expertise & Skills ─── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Expertise & Skills</h2>
                    <p className="text-gray-500 mt-1">Select at least 3 areas of expertise.</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm text-blue-700 font-medium">
                      {totalExpertise} selected {totalExpertise < 3 && `— need ${3 - totalExpertise} more`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {TECHNICAL_SKILLS.map(s => (
                        <SkillChip key={s} label={s} selected={selectedTechnical.includes(s)} onClick={() => toggleSkill(s, selectedTechnical, setSelectedTechnical)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Non-Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {NON_TECHNICAL_SKILLS.map(s => (
                        <SkillChip key={s} label={s} selected={selectedNonTechnical.includes(s)} onClick={() => toggleSkill(s, selectedNonTechnical, setSelectedNonTechnical)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Areas of Mentorship</h3>
                    <div className="flex flex-wrap gap-2">
                      {MENTORSHIP_AREAS.map(s => (
                        <SkillChip key={s} label={s} selected={selectedAreas.includes(s)} onClick={() => toggleSkill(s, selectedAreas, setSelectedAreas)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 5: About Mentor ─── */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">About You</h2>
                    <p className="text-gray-500 mt-1">Write a compelling bio for your mentor profile.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Professional Bio <span className="text-red-500">*</span></label>
                    <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      rows={6}
                      placeholder="Share your professional journey, expertise areas, and what mentees can expect from sessions with you..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-sm"
                    />
                    <p className={`text-xs ${bio.length < 300 ? "text-amber-600" : bio.length > 3000 ? "text-red-600" : "text-gray-400"}`}>
                      {bio.length}/3000 characters {bio.length < 300 && `(minimum 300)`}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Career Highlights & Achievements</label>
                    <textarea 
                      value={highlights} 
                      onChange={e => setHighlights(e.target.value)} 
                      rows={4}
                      placeholder="Major achievements, certifications, awards, notable projects..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* ─── STEP 6: Session Details ─── */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
                    <p className="text-gray-500 mt-1">Configure the types and pricing for your mentoring sessions.</p>
                  </div>

                  <div className="space-y-4">
                    {sessions.map((session, idx) => (
                      <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">Session {idx + 1}</h4>
                          {sessions.length > 1 && (
                            <button type="button" onClick={() => setSessions(sessions.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <SelectField label="Session Type" required options={SESSION_TYPES} value={session.type} onChange={e => {
                            const copy = [...sessions]; copy[idx].type = e.target.value; setSessions(copy);
                          }} />
                          <SelectField label="Duration" required options={DURATIONS.map(d => d.label)} value={`${session.duration} mins`} onChange={e => {
                            const copy = [...sessions]; copy[idx].duration = parseInt(e.target.value); setSessions(copy);
                          }} />
                          <InputField label="Price (₹)" required type="number" placeholder="999" value={session.price} onChange={e => {
                            const copy = [...sessions]; copy[idx].price = e.target.value; setSessions(copy);
                          }} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={session.freeDiscovery} onChange={e => {
                            const copy = [...sessions]; copy[idx].freeDiscovery = e.target.checked; if (e.target.checked) copy[idx].price = "0"; setSessions(copy);
                          }} className="rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                          Free Discovery Call
                        </label>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => setSessions([...sessions, { type: SESSION_TYPES[0], duration: 60, price: "999", freeDiscovery: false }])} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                    <Plus className="w-4 h-4" /> Add Another Session Type
                  </button>
                </div>
              )}

              {/* ─── STEP 7: Availability Schedule ─── */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
                    <p className="text-gray-500 mt-1">Set your availability for mentoring sessions.</p>
                  </div>

                  <div className="space-y-3">
                    {schedule.map((day, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${day.isAvailable ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-gray-50/50"}`}>
                        <label className="flex items-center gap-3 w-36 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.isAvailable}
                            onChange={() => {
                              const copy = [...schedule]; copy[idx].isAvailable = !copy[idx].isAvailable; setSchedule(copy);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-4 h-4"
                          />
                          <span className={`text-sm font-semibold ${day.isAvailable ? "text-gray-900" : "text-gray-400"}`}>{DAYS[idx]}</span>
                        </label>
                        {day.isAvailable ? (
                          <div className="flex items-center gap-3">
                            <input type="time" value={day.startTime} onChange={e => { const copy = [...schedule]; copy[idx].startTime = e.target.value; setSchedule(copy); }} className="p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                            <span className="text-gray-400 text-sm">to</span>
                            <input type="time" value={day.endTime} onChange={e => { const copy = [...schedule]; copy[idx].endTime = e.target.value; setSchedule(copy); }} className="p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── STEP 8: Social Profiles ─── */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Social Profiles</h2>
                    <p className="text-gray-500 mt-1">Connect your professional profiles for verification.</p>
                  </div>
                  <InputField label="LinkedIn Profile" required placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                  <InputField label="Portfolio Website" placeholder="https://yourwebsite.com" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="GitHub" placeholder="https://github.com/username" value={github} onChange={e => setGithub(e.target.value)} />
                    <InputField label="Twitter / X" placeholder="https://x.com/username" value={twitter} onChange={e => setTwitter(e.target.value)} />
                  </div>
                  <InputField label="YouTube" placeholder="https://youtube.com/@channel" value={youtube} onChange={e => setYoutube(e.target.value)} />
                </div>
              )}

              {/* ─── STEP 9: Verification Documents ─── */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Verification Documents</h2>
                    <p className="text-gray-500 mt-1">We require these to verify your identity and professional status.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Employee ID Card", desc: "JPG, PNG, PDF", file: employeeId, setFile: setEmployeeId, icon: User },
                      { label: "Government ID", desc: "Aadhaar, Passport, License", file: govtId, setFile: setGovtId, icon: ShieldCheck },
                      { label: "Resume", desc: "PDF Only", file: resume, setFile: setResume, icon: FileText }
                    ].map(({ label, desc, file, setFile, icon: Icon }) => (
                      <div key={label} className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{label}</p>
                            <p className="text-sm text-gray-500">{file ? file.name : desc}</p>
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

                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Company Email Verification</p>
                        <p className="text-sm text-gray-500">We&apos;ll send a verification link to your company email.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input type="email" placeholder="john@google.com" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm" />
                      <button className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">Verify</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 10: Review & Submit ─── */}
              {currentStep === 10 && !submitted && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Ready to Submit?</h2>
                    <p className="text-gray-500 mt-1 max-w-md mx-auto">Review your application summary. Our team will verify your documents within 24-48 hours.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Application Summary</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Personal Details", done: !!firstName && !!lastName },
                        { label: "Professional Info", done: !!designation && !!company },
                        { label: "Expertise & Skills", done: totalExpertise >= 3 },
                        { label: "Professional Bio", done: bio.length >= 300 },
                        { label: "Session Pricing", done: sessions.length > 0 },
                        { label: "Weekly Schedule", done: schedule.some(d => d.isAvailable) },
                        { label: "Social Profiles", done: !!linkedin },
                        { label: "Verification Docs", done: !!(employeeId && govtId && resume) }
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
              {submitted && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                  <p className="text-gray-500 max-w-md mb-8">
                    Thank you for applying to become a mentor on CareerConnect. Our verification team will review your application within 24-48 hours.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-semibold px-5 py-3 rounded-xl border border-amber-100 text-sm">
                    <Clock className="w-4 h-4" />
                    Status: Pending Review
                  </div>
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
                  <button className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Save as Draft
                  </button>

                  {currentStep < STEPS.length ? (
                    <button 
                      onClick={nextStep}
                      className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      Save & Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                    >
                      Submit Application
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
