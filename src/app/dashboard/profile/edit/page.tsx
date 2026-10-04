"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Upload, User, Sparkles, UploadCloud, FileText, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import { updateMentorProfileFull } from "@/actions/mentor-actions";
import { updateJobSeekerProfile, getJobSeekerProfile } from "@/actions/job-seeker-profile-actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isMentor = session?.user?.role === "MENTOR";
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      location: "",
      gender: "",
      dob: "",
      designation: "",
      company: "",
      skills: "",
      experienceLevel: "",
      roleCategory: "",
      profileSummary: "",
      isFresher: "false",
      targetDomains: "",
      targetJobTitle: "",
      specializations: "",
      employmentStatus: "",
      workPreferences: "",
      noticePeriod: "",
      expectedSalary: "",
      currentSalary: "",
      educations: [{ degree: "", college: "", passingYear: "", branch: "", collegeTier: "", scoreType: "", cgpa: "", currentlyStudying: false, tenthMarks: "", tenthYear: "", twelfthMarks: "", twelfthYear: "", diplomaBranch: "", diplomaYear: "" }],
      experiences: [{ jobTitle: "", companyName: "", location: "", duration: "" }],
      resumeUrl: ""
    }
  });

  const { fields: eduFields, append: eduAppend, remove: eduRemove } = useFieldArray({ control, name: "educations" });
  const { fields: expFields, append: expAppend, remove: expRemove } = useFieldArray({ control, name: "experiences" });

  useEffect(() => {
    async function loadData() {
      try {
        if (isMentor) {
          const res = await fetch("/api/mentor/profile");
          if (res.ok) {
            const mentor = await res.json();
            reset({
              name: mentor.user?.name || mentor.name || "",
              email: mentor.user?.email || "",
              mobile: mentor.user?.mobile || "",
              location: mentor.location || "",
              gender: mentor.user?.gender || "",
              dob: mentor.user?.dob ? new Date(mentor.user.dob).toISOString().split('T')[0] : "",
              designation: mentor.role || mentor.user?.jobTitle || "",
              company: mentor.company || mentor.user?.currentCompany || "",
              skills: mentor.skills?.map((s: any) => s.name).join(", ") || "",
              experienceLevel: mentor.experienceYears ? mentor.experienceYears.toString() : "",
              roleCategory: mentor.user?.roleCategory || "",
              profileSummary: mentor.about || mentor.user?.bio || "",
              isFresher: mentor.user?.isFresher ? "true" : "false",
              targetDomains: mentor.user?.targetDomains || "",
              targetJobTitle: mentor.user?.targetJobTitle || "",
              specializations: mentor.user?.specializations || "",
              employmentStatus: mentor.user?.employmentStatus || "",
              workPreferences: mentor.user?.workPreferences || "",
              noticePeriod: mentor.user?.noticePeriod || "",
              expectedSalary: mentor.user?.expectedSalary || "",
              currentSalary: mentor.user?.currentSalary || "",
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
              })) : [{ degree: "", college: "", passingYear: "", branch: "", collegeTier: "", scoreType: "", cgpa: "", currentlyStudying: false, tenthMarks: "", tenthYear: "", twelfthMarks: "", twelfthYear: "", diplomaBranch: "", diplomaYear: "" }],
              experiences: mentor.experiences?.length > 0 ? mentor.experiences.map((exp: any) => ({
                jobTitle: exp.designation,
                companyName: exp.companyName,
                location: exp.location || "",
                duration: exp.duration
              })) : [{ jobTitle: "", companyName: "", location: "", duration: "" }],
              resumeUrl: mentor.resumeUrl || ""
            });
          }
        } else {
          const user = await getJobSeekerProfile();
          reset({
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            location: user.location || "",
            gender: user.gender || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            designation: user.jobTitle || "",
            company: user.currentCompany || "",
            skills: user.skills?.map((s: any) => s.name).join(", ") || "",
            experienceLevel: user.experienceYears ? user.experienceYears.toString() : "",
            roleCategory: user.roleCategory || "",
            profileSummary: user.bio || "",
            isFresher: user.isFresher ? "true" : "false",
            targetDomains: user.targetDomains || "",
            targetJobTitle: user.targetJobTitle || "",
            specializations: user.specializations || "",
            employmentStatus: user.employmentStatus || "",
            workPreferences: user.workPreferences || "",
            noticePeriod: user.noticePeriod || "",
            expectedSalary: user.expectedSalary || "",
            currentSalary: user.currentSalary || "",
            educations: user.educations?.length > 0 ? user.educations.map((edu: any) => ({
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
            })) : [{ degree: "", college: "", passingYear: "", branch: "", collegeTier: "", scoreType: "", cgpa: "", currentlyStudying: false, tenthMarks: "", tenthYear: "", twelfthMarks: "", twelfthYear: "", diplomaBranch: "", diplomaYear: "" }],
            experiences: user.experiences?.length > 0 ? user.experiences.map((exp: any) => ({
              jobTitle: exp.designation || exp.jobTitle,
              companyName: exp.companyName,
              location: exp.location || "",
              duration: exp.duration
            })) : [{ jobTitle: "", companyName: "", location: "", duration: "" }],
            resumeUrl: ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsFetching(false);
      }
    }
    if (session) {
      loadData();
    }
  }, [reset, session, isMentor]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isMentor) {
        const res = await updateMentorProfileFull(data);
        if (res.success) {
          toast.success("Mentor Profile updated successfully");
          router.push("/mentor/profile");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update profile");
        }
      } else {
        const res = await updateJobSeekerProfile(data);
        if (res.success) {
          toast.success("Profile updated successfully");
          router.push("/dashboard/profile");
          router.refresh();
        } else {
          toast.error("Failed to update profile");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Resume must be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "resume");

    try {
      const res = await fetch("/api/mentor/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue("resumeUrl", data.url);
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resume");
    }
  };

  if (isFetching) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link href="/mentor/profile">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Update Profile</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Link href="/mentor/profile">
            <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-blue-600 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600">Name</Label>
              <Input {...register("name")} className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Email Address</Label>
              <Input {...register("email")} type="email" disabled className="bg-gray-50 border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Mobile Number</Label>
              <Input {...register("mobile")} className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Location</Label>
              <Input {...register("location")} placeholder="e.g. Bangalore, India" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Gender</Label>
              <select {...register("gender")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Date of Birth</Label>
              <Input {...register("dob")} type="date" className="border-gray-300" />
            </div>
          </div>
        </div>

        {/* Profile & Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-blue-600 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Professional & Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600">Designation / Role</Label>
              <Input {...register("designation")} placeholder="e.g. Senior Frontend Engineer" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Tags / Skills (Comma separated)</Label>
              <Input {...register("skills")} placeholder="React, Next.js, Node.js" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Total Experience (Years)</Label>
              <Input {...register("experienceLevel")} type="number" placeholder="5" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Role Category</Label>
              <Input {...register("roleCategory")} placeholder="e.g. Software Development" className="border-gray-300" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-600">Profile Summary / About</Label>
              <Textarea {...register("profileSummary")} placeholder="Briefly describe your career journey and achievements..." className="min-h-[120px] border-gray-300" />
            </div>
          </div>
        </div>

        {/* Career Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-blue-600 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Career Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-600 mb-2 block">Experience Level</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="true" {...register("isFresher")} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Fresher</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="false" {...register("isFresher")} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Experienced</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-600">Target Domains (e.g. Backend, Frontend)</Label>
              <Input {...register("targetDomains")} placeholder="Type domains separated by commas" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Role Title</Label>
              <Input {...register("targetJobTitle")} placeholder="Frontend Developer" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Specializations</Label>
              <Input {...register("specializations")} placeholder="React, Node.js" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Employment Status</Label>
              <select {...register("employmentStatus")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                <option value="">Select Status</option>
                <option value="Student">Student</option>
                <option value="Employed">Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Work Mode</Label>
              <select {...register("workPreferences")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                <option value="">Any</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>


            <div className="space-y-2">
              <Label className="text-gray-600">Notice Period / Joining</Label>
              <select {...register("noticePeriod")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                <option value="">Select Notice Period</option>
                <option value="Immediate joiner">Immediate joiner</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="2 Months">2 Months</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Expected Salary (LPA)</Label>
              <Input {...register("expectedSalary")} placeholder="e.g. 5LPA" className="border-gray-300" />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600">Current Salary (LPA)</Label>
              <Input {...register("currentSalary")} placeholder="e.g. 3LPA" className="border-gray-300" />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-blue-600 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Education
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => eduAppend({ degree: "", college: "", passingYear: "" } as any)} className="text-blue-600 border-blue-600">
              <Plus className="w-4 h-4 mr-1" /> Add Education
            </Button>
          </div>
          
          <div className="space-y-6">
            {eduFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start relative p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                <div className="absolute top-2 right-2 z-10">
                  <Button type="button" variant="ghost" size="icon" onClick={() => eduRemove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* College Info */}
                <div className="space-y-2 pr-8">
                  <Label className="text-xs text-gray-500">Highest Qualification</Label>
                  <select {...register(`educations.${index}.degree` as const)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                    <option value="">Select Qualification</option>
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="M.Tech">M.Tech / M.E.</option>
                    <option value="MCA">MCA</option>
                    <option value="BCA">BCA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="Ph.D">Ph.D</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Branch / Course</Label>
                  <Input {...register(`educations.${index}.branch` as const)} placeholder="Computer Science" className="border-gray-300 bg-white" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs text-gray-500">College Name</Label>
                  <Input {...register(`educations.${index}.college` as const)} placeholder="Enter full college name" className="border-gray-300 bg-white" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">College Tier / Institute</Label>
                  <select {...register(`educations.${index}.collegeTier` as const)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                    <option value="">Select Tier</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Score Type</Label>
                  <select {...register(`educations.${index}.scoreType` as const)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm">
                    <option value="">Select Type</option>
                    <option value="CGPA">CGPA</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register(`educations.${index}.currentlyStudying` as const)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                    <span className="text-sm font-medium text-gray-700">Currently studying (final year)</span>
                  </label>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Graduation Year (Batch)</Label>
                  <Input {...register(`educations.${index}.passingYear` as const)} placeholder="2025" type="number" className="border-gray-300 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Score / CGPA</Label>
                  <Input {...register(`educations.${index}.cgpa` as const)} placeholder="8.5" type="number" step="0.01" className="border-gray-300 bg-white" />
                </div>

                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase">School Records (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">10th Marks (%)</Label>
                      <Input {...register(`educations.${index}.tenthMarks` as const)} placeholder="90" type="number" className="border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">10th Year</Label>
                      <Input {...register(`educations.${index}.tenthYear` as const)} placeholder="2017" type="number" className="border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">12th Marks (%)</Label>
                      <Input {...register(`educations.${index}.twelfthMarks` as const)} placeholder="85" type="number" className="border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">12th Year</Label>
                      <Input {...register(`educations.${index}.twelfthYear` as const)} placeholder="2019" type="number" className="border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Diploma Branch</Label>
                      <Input {...register(`educations.${index}.diplomaBranch` as const)} placeholder="e.g. Mechanical" className="border-gray-300 bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Diploma Year</Label>
                      <Input {...register(`educations.${index}.diplomaYear` as const)} placeholder="e.g. 2020" type="number" className="border-gray-300 bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {eduFields.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No education added.</p>}
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-blue-600 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Work Experience
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => expAppend({ jobTitle: "", companyName: "", location: "", duration: "" })} className="text-blue-600 border-blue-600">
              <Plus className="w-4 h-4 mr-1" /> Add Experience
            </Button>
          </div>
          
          <div className="space-y-6">
            {expFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-100 bg-gray-50/50 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => expRemove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 pr-8">
                  <Label className="text-xs text-gray-500">Job Title</Label>
                  <Input {...register(`experiences.${index}.jobTitle` as const)} placeholder="Software Engineer" className="border-gray-300 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Company Name</Label>
                  <Input {...register(`experiences.${index}.companyName` as const)} placeholder="Google" className="border-gray-300 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Location</Label>
                  <Input {...register(`experiences.${index}.location` as const)} placeholder="New York, USA" className="border-gray-300 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Duration</Label>
                  <Input {...register(`experiences.${index}.duration` as const)} placeholder="Jan 2020 - Present" className="border-gray-300 bg-white" />
                </div>
              </div>
            ))}
            {expFields.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No experience added.</p>}
          </div>
        </div>
        
        {/* Resume */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-blue-600 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Resume
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <Label className="text-gray-600 mb-2 block">Upload your latest resume</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-blue-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX (Max 2MB)</span>
                </label>
              </div>
            </div>
            <div className="flex-1 w-full">
              {watch("resumeUrl") ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Resume Uploaded</p>
                      <a href={watch("resumeUrl")} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline">
                        View Resume
                      </a>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setValue("resumeUrl", "")} className="text-red-500 hover:bg-red-50">Remove</Button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500">No resume uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-gray-50/90 backdrop-blur p-4 rounded-xl">
            <Link href={isMentor ? "/mentor/profile" : "/dashboard/profile"}>
              <Button type="button" variant="outline" className="px-8 py-6 rounded-xl font-medium">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-10 py-6 rounded-xl font-medium shadow-md shadow-orange-500/20">
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
  );
}
