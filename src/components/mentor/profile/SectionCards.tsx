"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Loader2, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMentorProfile } from "@/contexts/MentorProfileContext";

export function SectionCards() {
  const { 
    mentorData: mentor, 
    saveSection, 
    isSaving,
    setPendingChanges,
    pendingChanges,
    handleNextMissingDetail,
    globalSave
  } = useMentorProfile();

  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  
  // Local state for array additions
  const [newExperience, setNewExperience] = useState({ companyName: "", designation: "", duration: "", responsibilities: "" });
  const [newEducation, setNewEducation] = useState({ college: "", degree: "", passingYear: "" });
  const [newProject, setNewProject] = useState({ title: "", technologies: "", description: "", githubUrl: "", demoUrl: "" });
  const [newSkill, setNewSkill] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll listener
  useEffect(() => {
    const handleOpenMissing = (e: any) => {
      const target = e.detail?.target;
      if (target) {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setEditMode(prev => ({ ...prev, [target]: true }));
        }
      }
    };
    document.addEventListener("open-missing-detail", handleOpenMissing);
    return () => document.removeEventListener("open-missing-detail", handleOpenMissing);
  }, []);

  const toggleEdit = (section: string) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePending = (field: string, value: any) => {
    setPendingChanges(prev => ({ ...prev, [field]: value }));
  };

  const getValue = (field: string) => {
    return pendingChanges[field] !== undefined ? pendingChanges[field] : mentor?.[field] || "";
  };

  const handleSaveAndAdvance = async (field: string, data: any, sectionId: string) => {
    const success = await saveSection(field, data);
    if (success) {
      setEditMode(prev => ({ ...prev, [sectionId]: false }));
      // Optional: Auto-advance to next missing detail
      setTimeout(() => {
        handleNextMissingDetail();
      }, 500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/mentor/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      const fieldToUpdate = type === 'resume' ? 'resumeUrl' : 'image';
      await saveSection(fieldToUpdate, data.url);
      
    } catch (error) {
      console.error(error);
      alert("Failed to upload file");
    }
  };

  const renderCardTitle = (title: string, sectionId: string, actionText: string = "Edit") => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      {!editMode[sectionId] && (
        <button 
          onClick={() => toggleEdit(sectionId)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const renderActionButtons = (sectionId: string, fieldToSave: string, dataToSave: any) => (
    <div className="flex gap-2 justify-end mt-4">
      <button onClick={() => toggleEdit(sectionId)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
      <button 
        disabled={isSaving} 
        onClick={() => handleSaveAndAdvance(fieldToSave, dataToSave, sectionId)} 
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Changes
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      
      {/* Profile Photo Upload */}
      <Card id="profile-photo" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">Profile Photo</h3>
            <button onClick={() => photoInputRef.current?.click()} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
          {mentor?.image || mentor?.user?.image ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <img src={mentor.image || mentor.user.image} alt="Profile" className="object-cover w-full h-full" />
              </div>
              <span>Photo uploaded</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/30" onClick={() => photoInputRef.current?.click()}>
              Click to upload a profile photo
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Headline */}
      <Card id="resume-headline" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Resume headline", "resume-headline")}
          {editMode["resume-headline"] ? (
            <div className="space-y-3">
              <Textarea 
                value={getValue("headline")}
                onChange={e => updatePending("headline", e.target.value)}
                placeholder="Senior Software Engineer | Ex Google | 5 Years Experience"
                className="mt-2"
                rows={2}
              />
              {renderActionButtons("resume-headline", "headline", getValue("headline"))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mentor?.headline || "Add a summary of your professional expertise and key skills."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile Summary / About */}
      <Card id="profile-summary" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Profile summary (About)", "profile-summary")}
          {editMode["profile-summary"] ? (
            <div className="space-y-3">
              <Textarea 
                value={getValue("bio")} 
                onChange={(e) => updatePending("bio", e.target.value)} 
                className="min-h-[150px] resize-y"
                placeholder="Write a detailed professional summary..."
              />
              <div className="pt-4">
                {renderActionButtons("profile-summary", "bio", getValue("bio"))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {mentor?.bio || "Add a detailed professional summary."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card id="contact-info" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Contact Information", "contact-info")}
          {editMode["contact-info"] ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile Number</label>
                  <Input value={getValue("mobile")} onChange={e => updatePending("mobile", e.target.value)} placeholder="e.g. +1 234 567 890" />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => toggleEdit("contact-info")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                <button disabled={isSaving} onClick={async () => {
                  await saveSection("mobile", getValue("mobile"));
                  setEditMode(prev => ({...prev, "contact-info": false}));
                }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Mobile:</span> {mentor?.mobile || mentor?.user?.mobile || "-"}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card id="personal-info" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Personal Information", "personal-info")}
          {editMode["personal-info"] ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                  <Input value={getValue("city")} onChange={e => updatePending("city", e.target.value)} placeholder="e.g. San Francisco" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                  <Input value={getValue("country")} onChange={e => updatePending("country", e.target.value)} placeholder="e.g. USA" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                  <Input value={getValue("gender")} onChange={e => updatePending("gender", e.target.value)} placeholder="e.g. Male/Female" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Timezone</label>
                  <Input value={getValue("timezone")} onChange={e => updatePending("timezone", e.target.value)} placeholder="e.g. PST" />
                </div>
              </div>
              {/* Combine updates for this card */}
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => toggleEdit("personal-info")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                <button disabled={isSaving} onClick={async () => {
                  await saveSection("city", getValue("city"));
                  await saveSection("country", getValue("country"));
                  await saveSection("gender", getValue("gender"));
                  await saveSection("timezone", getValue("timezone"));
                  setEditMode(prev => ({...prev, "personal-info": false}));
                }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">City:</span> {mentor?.city || "-"}</div>
              <div><span className="text-muted-foreground">Country:</span> {mentor?.country || "-"}</div>
              <div><span className="text-muted-foreground">Gender:</span> {mentor?.gender || "-"}</div>
              <div><span className="text-muted-foreground">Timezone:</span> {mentor?.timezone || "-"}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card id="professional-info" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Professional Information", "professional-info")}
          {editMode["professional-info"] ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Employment Type</label>
                  <Input value={getValue("employmentType")} onChange={e => updatePending("employmentType", e.target.value)} placeholder="e.g. Full-time" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Career Level</label>
                  <Input value={getValue("careerLevel")} onChange={e => updatePending("careerLevel", e.target.value)} placeholder="e.g. Senior" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notice Period</label>
                  <Input value={getValue("noticePeriod")} onChange={e => updatePending("noticePeriod", e.target.value)} placeholder="e.g. 30 Days" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Current CTC</label>
                  <Input value={getValue("currentCTC")} onChange={e => updatePending("currentCTC", e.target.value)} placeholder="e.g. $120,000" />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => toggleEdit("professional-info")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                <button disabled={isSaving} onClick={async () => {
                  await saveSection("employmentType", getValue("employmentType"));
                  await saveSection("careerLevel", getValue("careerLevel"));
                  await saveSection("noticePeriod", getValue("noticePeriod"));
                  await saveSection("currentCTC", getValue("currentCTC"));
                  setEditMode(prev => ({...prev, "professional-info": false}));
                }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Type:</span> {mentor?.employmentType || "-"}</div>
              <div><span className="text-muted-foreground">Level:</span> {mentor?.careerLevel || "-"}</div>
              <div><span className="text-muted-foreground">Notice Period:</span> {mentor?.noticePeriod || "-"}</div>
              <div><span className="text-muted-foreground">CTC:</span> {mentor?.currentCTC || "-"}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card id="experience" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Experience", "experience", "Add Experience")}
          
          <div className="space-y-6">
            {mentor?.experiences?.length > 0 ? (
              <div className="space-y-4">
                {mentor.experiences.map((exp: any, i: number) => (
                  <div key={i} className="relative pl-4 border-l-2 border-blue-100 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{exp.companyName}</h4>
                        <p className="text-sm text-foreground font-medium">{exp.designation}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                      </div>
                      <button onClick={() => {
                        const newArray = mentor.experiences.filter((_:any, index:number) => index !== i);
                        saveSection("experiences", newArray);
                      }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                    {exp.responsibilities && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{exp.responsibilities}</p>}
                  </div>
                ))}
                {!editMode["experience"] && (
                  <button 
                    onClick={() => toggleEdit("experience")} 
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 block"
                  >
                    + Add more experience
                  </button>
                )}
              </div>
            ) : (
              !editMode["experience"] && (
                <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">Your employment details will help mentees understand your experience.</p>
                  <button onClick={() => toggleEdit("experience")} className="px-4 py-2 text-sm bg-white border border-border shadow-sm rounded-xl font-semibold hover:bg-muted transition-colors">
                    Add Experience
                  </button>
                </div>
              )
            )}
            
            {editMode["experience"] && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                <Input placeholder="Company Name" value={newExperience.companyName} onChange={e => setNewExperience(prev => ({...prev, companyName: e.target.value}))} />
                <Input placeholder="Designation" value={newExperience.designation} onChange={e => setNewExperience(prev => ({...prev, designation: e.target.value}))} />
                <Input placeholder="Duration (e.g. 2020 - Present)" value={newExperience.duration} onChange={e => setNewExperience(prev => ({...prev, duration: e.target.value}))} />
                <Textarea placeholder="Responsibilities" rows={2} value={newExperience.responsibilities} onChange={e => setNewExperience(prev => ({...prev, responsibilities: e.target.value}))} />
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={() => toggleEdit("experience")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const exps = mentor?.experiences || [];
                      await saveSection("experiences", [...exps, newExperience]);
                      setNewExperience({ companyName: "", designation: "", duration: "", responsibilities: "" });
                    }} 
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    Save & Add Another
                  </button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const exps = mentor?.experiences || [];
                      await handleSaveAndAdvance("experiences", [...exps, newExperience], "experience");
                      setNewExperience({ companyName: "", designation: "", duration: "", responsibilities: "" });
                    }} 
                    className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Save Experience
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card id="education" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Education", "education", "Add Education")}
          <div className="space-y-6">
            {mentor?.educations?.length > 0 ? (
              <div className="space-y-4">
                {mentor.educations.map((edu: any, i: number) => (
                  <div key={i} className="relative pl-4 border-l-2 border-blue-100 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{edu.degree}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{edu.college}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Class of {edu.passingYear}</p>
                      </div>
                      <button onClick={() => {
                        const newArray = mentor.educations.filter((_:any, index:number) => index !== i);
                        saveSection("educations", newArray);
                      }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ))}
                {!editMode["education"] && (
                  <button 
                    onClick={() => toggleEdit("education")} 
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 block"
                  >
                    + Add more education
                  </button>
                )}
              </div>
            ) : (
              !editMode["education"] && (
                <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">Add your educational background.</p>
                  <button onClick={() => toggleEdit("education")} className="px-4 py-2 text-sm bg-white border border-border shadow-sm rounded-xl font-semibold hover:bg-muted transition-colors">
                    Add Education
                  </button>
                </div>
              )
            )}

            {editMode["education"] && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                <Input placeholder="Degree (e.g. B.Tech in Computer Science)" value={newEducation.degree} onChange={e => setNewEducation(prev => ({...prev, degree: e.target.value}))} />
                <Input placeholder="College/University" value={newEducation.college} onChange={e => setNewEducation(prev => ({...prev, college: e.target.value}))} />
                <Input placeholder="Passing Year (e.g. 2024)" value={newEducation.passingYear} onChange={e => setNewEducation(prev => ({...prev, passingYear: e.target.value}))} />
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={() => toggleEdit("education")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const edus = mentor?.educations || [];
                      await saveSection("educations", [...edus, newEducation]);
                      setNewEducation({ college: "", degree: "", passingYear: "" });
                      // Don't close edit mode, let them add another
                    }} 
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    Save & Add Another
                  </button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const edus = mentor?.educations || [];
                      await handleSaveAndAdvance("educations", [...edus, newEducation], "education");
                      setNewEducation({ college: "", degree: "", passingYear: "" });
                    }} 
                    className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Save Education
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card id="projects" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Projects", "projects", "Add Project")}
          <div className="space-y-6">
            {mentor?.projects?.length > 0 ? (
              <div className="space-y-4">
                {mentor.projects.map((proj: any, i: number) => (
                  <div key={i} className="pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{proj.title}</h4>
                        {proj.technologies && <p className="text-xs text-blue-600 font-medium mt-1">{proj.technologies}</p>}
                        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" className="text-xs text-muted-foreground hover:underline mr-2">GitHub</a>}
                        {proj.demoUrl && <a href={proj.demoUrl} target="_blank" className="text-xs text-muted-foreground hover:underline">Demo</a>}
                      </div>
                      <button onClick={() => {
                        const newArray = mentor.projects.filter((_:any, index:number) => index !== i);
                        saveSection("projects", newArray);
                      }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                    {proj.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{proj.description}</p>}
                  </div>
                ))}
                {!editMode["projects"] && (
                  <button 
                    onClick={() => toggleEdit("projects")} 
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 block"
                  >
                    + Add more projects
                  </button>
                )}
              </div>
            ) : (
              !editMode["projects"] && (
                <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">Stand out by adding details about projects that you have done.</p>
                  <button onClick={() => toggleEdit("projects")} className="px-4 py-2 text-sm bg-white border border-border shadow-sm rounded-xl font-semibold hover:bg-muted transition-colors">
                    Add Project
                  </button>
                </div>
              )
            )}

            {editMode["projects"] && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border mt-4">
                <Input placeholder="Project Title" value={newProject.title} onChange={e => setNewProject(prev => ({...prev, title: e.target.value}))} />
                <Input placeholder="Technologies (e.g. React, Node.js)" value={newProject.technologies} onChange={e => setNewProject(prev => ({...prev, technologies: e.target.value}))} />
                <Input placeholder="GitHub URL" value={newProject.githubUrl} onChange={e => setNewProject(prev => ({...prev, githubUrl: e.target.value}))} />
                <Input placeholder="Live Demo URL" value={newProject.demoUrl} onChange={e => setNewProject(prev => ({...prev, demoUrl: e.target.value}))} />
                <Textarea placeholder="Project Description" rows={2} value={newProject.description} onChange={e => setNewProject(prev => ({...prev, description: e.target.value}))} />
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={() => toggleEdit("projects")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const projs = mentor?.projects || [];
                      await saveSection("projects", [...projs, newProject]);
                      setNewProject({ title: "", technologies: "", description: "", githubUrl: "", demoUrl: "" });
                    }} 
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    Save & Add Another
                  </button>
                  <button 
                    disabled={isSaving} 
                    onClick={async () => {
                      const projs = mentor?.projects || [];
                      await handleSaveAndAdvance("projects", [...projs, newProject], "projects");
                      setNewProject({ title: "", technologies: "", description: "", githubUrl: "", demoUrl: "" });
                    }} 
                    className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card id="key-skills" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          {renderCardTitle("Key Skills", "key-skills", "Manage Skills")}
          
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor?.skills?.length > 0 ? mentor.skills.map((s: any, i: number) => (
              <span key={i} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium flex items-center gap-1">
                {s.name || s}
                <button onClick={() => {
                  const newArray = mentor.skills.filter((_:any, index:number) => index !== i);
                  saveSection("technicalSkills", newArray.map((x:any)=>x.name || x));
                }} className="hover:text-red-500 ml-1">x</button>
              </span>
            )) : (
              !editMode["key-skills"] && <p className="text-sm text-muted-foreground">No skills added yet.</p>
            )}
          </div>

          {editMode["key-skills"] && (
            <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border mt-4">
              <Input placeholder="Enter a skill (e.g. React) and save" value={newSkill} onChange={e => setNewSkill(e.target.value)} />
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => toggleEdit("key-skills")} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors">Cancel</button>
                <button 
                  disabled={isSaving || !newSkill.trim()} 
                  onClick={async () => {
                    const existing = mentor?.skills || [];
                    await handleSaveAndAdvance("technicalSkills", [...existing.map((s:any) => s.name || s), newSkill], "key-skills");
                    setNewSkill("");
                  }} 
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save Skill
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume */}
      <Card id="resume" className="shadow-sm border-border scroll-mt-24">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-foreground">Resume</h3>
          </div>
          
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.rtf" onChange={(e) => handleFileUpload(e, 'resume')} />
          
          <div className="mt-4 border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-blue-50/30">
            {mentor?.resumeUrl ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-green-600">Resume Uploaded Successfully!</p>
                <a href={mentor.resumeUrl} target="_blank" className="text-xs text-blue-600 underline">View Resume</a>
                <div className="mt-4 flex gap-2 justify-center">
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-full font-semibold text-xs hover:bg-blue-50">Replace</button>
                  <button onClick={() => saveSection("resumeUrl", "")} className="px-4 py-1.5 border border-red-600 text-red-600 rounded-full font-semibold text-xs hover:bg-red-50">Delete</button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 border border-blue-600 text-blue-600 rounded-full font-semibold text-sm hover:bg-blue-50 transition-colors">
                  Upload Resume
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported Formats: doc, docx, rtf, pdf, upto 2 MB
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Save & View Profile Action */}
      <div className="flex justify-end pt-4 pb-8">
        <button 
          disabled={isSaving}
          onClick={async () => {
            if (Object.keys(pendingChanges).length > 0) {
              await globalSave();
            }
            window.open(`/mentors/${mentor?.id}`, '_blank');
          }}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save & View Public Profile
        </button>
      </div>
      
    </div>
  );
}
