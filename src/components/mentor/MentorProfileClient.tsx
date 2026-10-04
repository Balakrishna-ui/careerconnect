"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Briefcase, Phone, Mail, Clock, FileText, Pencil, Plus, GraduationCap, CheckCircle2, Download, Trash2, Calendar, Target, Save, Loader2, X, Camera } from "lucide-react";
import Link from "next/link";
import { updateMentorProfileFull } from "@/actions/mentor-actions";
import { toast } from "sonner";
import { useRef } from "react";

export function MentorProfileClient({ mentor, completionPercent }: { mentor: any, completionPercent: number }) {
  const router = useRouter();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setIsUploadingAvatar(true);
    else setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/mentor/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const imageUrl = data.url;

      const updateData = type === "avatar" ? { image: imageUrl } : { coverImage: imageUrl };
      
      const updateRes = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!updateRes.ok) throw new Error("Failed to save image to profile");

      toast.success(`${type === "avatar" ? "Profile" : "Cover"} image updated!`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      if (type === "avatar") setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: mentor.user?.name || mentor.name || "",
      email: mentor.user?.email || "",
      mobile: mentor.user?.mobile || "",
      location: mentor.location || "",
      gender: mentor.user?.gender || "",
      dob: mentor.user?.dob ? new Date(mentor.user.dob).toISOString().split('T')[0] : "",
      designation: mentor.role || "",
      company: mentor.company || "",
      skills: mentor.skills?.map((s: any) => s.name).join(", ") || "",
      experienceLevel: mentor.experienceYears ? mentor.experienceYears.toString() : "",
      profileSummary: mentor.bio || "",
      headline: mentor.headline || "",
      noticePeriod: mentor.noticePeriod || "",
      resumeUrl: mentor.resumeUrl || "",
      educations: mentor.educations?.length > 0 ? mentor.educations.map((edu: any) => ({
        degree: edu.degree || "",
        college: edu.college || "",
        passingYear: edu.passingYear || "",
        branch: edu.branch || "",
        collegeTier: edu.collegeTier || "",
        scoreType: edu.scoreType || "",
        cgpa: edu.cgpa || "",
        currentlyStudying: edu.currentlyStudying || false,
        tenthMarks: edu.tenthMarks || "",
        tenthYear: edu.tenthYear || "",
        twelfthMarks: edu.twelfthMarks || "",
        twelfthYear: edu.twelfthYear || "",
        diplomaBranch: edu.diplomaBranch || "",
        diplomaYear: edu.diplomaYear || ""
      })) : [{ degree: "", college: "", passingYear: "", branch: "", collegeTier: "", scoreType: "", cgpa: "", currentlyStudying: false }],
      experiences: mentor.experiences?.length > 0 ? mentor.experiences.map((exp: any) => ({
        jobTitle: exp.designation,
        companyName: exp.companyName,
        location: exp.location || "",
        duration: exp.duration
      })) : [{ jobTitle: "", companyName: "", location: "", duration: "" }],
      projects: mentor.projects?.length > 0 ? mentor.projects.map((proj: any) => ({
        name: proj.name || "",
        url: proj.url || "",
        description: proj.description || ""
      })) : [{ name: "", url: "", description: "" }]
    }
  });

  const { fields: eduFields, append: eduAppend, remove: eduRemove } = useFieldArray({ control, name: "educations" });
  const { fields: expFields, append: expAppend, remove: expRemove } = useFieldArray({ control, name: "experiences" });
  const { fields: projFields, append: projAppend, remove: projRemove } = useFieldArray({ control, name: "projects" });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await updateMentorProfileFull(data);
      if (res.success) {
        toast.success("Profile updated successfully");
        setEditingSection(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    reset(); // Revert to initial values
    setEditingSection(null);
  };

  const quickLinks = [
    { id: "skills", label: "Key skills" },
    { id: "employment", label: "Employment" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "summary", label: "Profile summary" },
    { id: "mentorship", label: "Mentorship Details" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4 pt-6 bg-[#f8f9fa] min-h-screen">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 relative overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 w-full bg-slate-200 relative group">
          {mentor.coverImage ? (
            <img src={mentor.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100" />
          )}
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} />
          <Button 
            onClick={() => coverInputRef.current?.click()} 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-gray-800"
            disabled={isUploadingCover}
          >
            {isUploadingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
            Edit Cover
          </Button>
        </div>

        <div className="p-6 md:p-8 relative">
          <div className="absolute top-6 right-6">
            <Button onClick={() => setEditingSection("personal")} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          </div>

        {editingSection === "personal" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input {...register("mobile")} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...register("location")} placeholder="City, State" />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input {...register("experienceLevel")} type="number" />
              </div>
              <div className="space-y-2">
                <Label>Notice Period</Label>
                <Input {...register("noticePeriod")} placeholder="e.g. 30 Days" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start -mt-16">
            {/* Avatar with Progress Ring */}
            <div className="relative shrink-0 z-10 group">
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "avatar")} />
              <div 
                className="w-32 h-32 rounded-full p-1 border-[3px] border-emerald-500 relative bg-white cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 relative">
                  {mentor.image || mentor.user?.image ? (
                    <img src={mentor.image || mentor.user?.image || ""} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    mentor.user?.name?.charAt(0) || "M"
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-emerald-500 text-xs font-bold text-emerald-600">
                  {completionPercent}%
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 w-full pt-16 md:pt-16">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {mentor.user?.name}
                <Pencil onClick={() => setEditingSection("personal")} className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Profile last updated - {mentor.updatedAt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{mentor.location || mentor.user?.location || "Add Location"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{mentor.experienceYears ? `${mentor.experienceYears} Years Exp` : "Fresher"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{mentor.noticePeriod || "Available to join immediately"}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{mentor.user?.mobile || "Add Phone Number"}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{mentor.user?.email}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-[260px] shrink-0 hidden md:block">
          <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50/80 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-[15px]">Quick links</h3>
            </div>
            <nav className="flex flex-col py-2">
              {quickLinks.map((link) => (
                <a 
                  key={link.id}
                  href={`#${link.id}`} 
                  className="px-5 py-3 text-[14px] text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 flex items-center justify-between group transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="flex-1 space-y-6">
          


          {/* Key Skills */}
          <div id="skills" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Key skills
                {editingSection !== "skills" && <Pencil onClick={() => setEditingSection("skills")} className="w-3.5 h-3.5 text-blue-600 cursor-pointer" />}
              </h3>
            </div>

            {editingSection === "skills" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Skills (Comma separated)</Label>
                  <Textarea {...register("skills")} placeholder="React, Node.js, TypeScript" className="h-24" />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {mentor.skills && mentor.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {mentor.skills.map((skill: any) => (
                      <Badge key={skill.id} variant="outline" className="px-4 py-1.5 rounded-full text-[13px] font-normal border-gray-300 text-gray-700">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No skills added yet.</p>
                )}
              </>
            )}
          </div>

          {/* Employment */}
          <div id="employment" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Employment</h3>
              {editingSection !== "employment" && (
                <span onClick={() => setEditingSection("employment")} className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  {mentor.experiences?.length > 0 ? "Edit employment" : "Add employment"}
                </span>
              )}
            </div>
            
            {editingSection === "employment" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {expFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => expRemove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title / Designation</Label>
                        <Input {...register(`experiences.${index}.jobTitle` as const)} placeholder="Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input {...register(`experiences.${index}.companyName` as const)} placeholder="Google" />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input {...register(`experiences.${index}.duration` as const)} placeholder="Jan 2020 - Present" />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input {...register(`experiences.${index}.location` as const)} placeholder="New York, NY" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" onClick={() => expAppend({ jobTitle: "", companyName: "", location: "", duration: "" })} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Another Experience
                </Button>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {mentor.experiences && mentor.experiences.length > 0 ? (
                  <div className="space-y-6">
                    {mentor.experiences.map((exp: any, idx: number) => (
                      <div key={exp.id} className={`${idx !== mentor.experiences.length - 1 ? "border-b border-gray-100 pb-6" : ""}`}>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {exp.designation || exp.jobTitle}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">{exp.companyName}</p>
                        <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-4">
                          <span>{exp.duration}</span> 
                          {exp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Your employment details will help recruiters understand your experience.</p>
                )}
              </>
            )}
          </div>

          {/* Education */}
          <div id="education" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Education</h3>
              {editingSection !== "education" && (
                <span onClick={() => setEditingSection("education")} className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  {mentor.educations?.length > 0 ? "Edit education" : "Add education"}
                </span>
              )}
            </div>
            
            {editingSection === "education" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {eduFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => eduRemove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input {...register(`educations.${index}.degree` as const)} placeholder="B.Tech" />
                      </div>
                      <div className="space-y-2">
                        <Label>College/University</Label>
                        <Input {...register(`educations.${index}.college` as const)} placeholder="MIT" />
                      </div>
                      <div className="space-y-2">
                        <Label>Passing Year</Label>
                        <Input {...register(`educations.${index}.passingYear` as const)} placeholder="2020" />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch/Specialization</Label>
                        <Input {...register(`educations.${index}.branch` as const)} placeholder="Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>Score/CGPA</Label>
                        <Input {...register(`educations.${index}.cgpa` as const)} placeholder="8.5" />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={() => eduAppend({ degree: "", college: "", passingYear: "", branch: "", collegeTier: "", scoreType: "", cgpa: "", currentlyStudying: false })} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Another Education
                </Button>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {mentor.educations && mentor.educations.length > 0 ? (
                  <div className="space-y-6">
                    {mentor.educations.map((edu: any, idx: number) => (
                      <div key={edu.id} className={`${idx !== mentor.educations.length - 1 ? "border-b border-gray-100 pb-6" : ""}`}>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {edu.degree} {edu.branch ? `- ${edu.branch}` : ""}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">{edu.college}</p>
                        <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-4">
                          <span>Passing Year: {edu.passingYear}</span>
                          {edu.cgpa && <span>Score: {edu.cgpa}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Add details of your educational background.</p>
                )}
              </>
            )}
          </div>

          {/* Projects */}
          <div id="projects" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Projects</h3>
              {editingSection !== "projects" && (
                <span onClick={() => setEditingSection("projects")} className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  {mentor.projects?.length > 0 ? "Edit projects" : "Add project"}
                </span>
              )}
            </div>
            
            {editingSection === "projects" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {projFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => projRemove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input {...register(`projects.${index}.name` as const)} placeholder="E-commerce Platform" />
                      </div>
                      <div className="space-y-2">
                        <Label>Project URL</Label>
                        <Input {...register(`projects.${index}.url` as const)} placeholder="https://github.com/..." />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Textarea {...register(`projects.${index}.description` as const)} placeholder="Built a full-stack e-commerce app..." className="h-20" />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={() => projAppend({ name: "", url: "", description: "" })} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Another Project
                </Button>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {mentor.projects && mentor.projects.length > 0 ? (
                  <div className="space-y-6">
                    {mentor.projects.map((proj: any, idx: number) => (
                      <div key={proj.id} className={`${idx !== mentor.projects.length - 1 ? "border-b border-gray-100 pb-6" : ""}`}>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {proj.name}
                        </h4>
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-[13px] text-blue-600 hover:underline mt-1 block">{proj.url}</a>}
                        <p className="text-[13px] text-gray-700 mt-2 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Stand out to employers by adding details about projects that you have done so far.</p>
                )}
              </>
            )}
          </div>

          {/* Profile Summary */}
          <div id="summary" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Profile summary
                {editingSection !== "summary" && <Pencil onClick={() => setEditingSection("summary")} className="w-3.5 h-3.5 text-blue-600 cursor-pointer" />}
              </h3>
            </div>
            
            {editingSection === "summary" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Professional Headline</Label>
                  <Input {...register("headline")} placeholder="Senior Software Engineer at Google" />
                </div>
                <div className="space-y-2">
                  <Label>About You</Label>
                  <Textarea {...register("profileSummary")} placeholder="I am a software engineer with..." className="h-32" />
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {mentor.headline && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Headline</h4>
                    <p className="text-sm text-gray-700">{mentor.headline}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">About</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {mentor.bio || "Add a professional summary to highlight your expertise and value proposition."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mentorship Details */}
          <div id="mentorship" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Mentorship Details</h3>
              <Link href="/mentor/settings">
                <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">Edit settings</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-blue-600" /> Session Types
                </h4>
                {mentor.sessionTypes && mentor.sessionTypes.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {mentor.sessionTypes.map((st: any) => (
                      <li key={st.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                        <span>{st.duration} mins</span>
                        <span className="font-medium text-gray-900">₹{st.price}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No session types configured.</p>
                )}
              </div>
              
              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-600" /> Availability
                </h4>
                <p className="text-sm text-gray-700">
                  {mentor.settings ? "Availability is configured and active." : "Set your availability to start receiving bookings."}
                </p>
                <Link href="/mentor/availability">
                  <Button variant="outline" size="sm" className="mt-4 border-purple-600 text-purple-600 hover:bg-purple-50">
                    Manage Availability
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
