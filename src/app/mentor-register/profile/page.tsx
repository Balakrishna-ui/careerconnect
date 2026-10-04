"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data, updateData, clearData } = useMentorRegistration();
  
  const [bio, setBio] = useState(data.bio || "");
  const [image, setImage] = useState(data.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => {
    updateData({ bio, image });
    router.push("/mentor-register/offerings");
  };

  const handleFinish = async () => {
    // Save final bits
    updateData({ bio, image });
    
    // We need Basic Details to proceed
    if (!data.firstName || !data.lastName || !data.email || !data.password) {
      setError("Missing basic details. Please go back to step 1.");
      return;
    }

    if (!bio || bio.length < 300) {
      setError("Your bio must be at least 300 characters long to help mentees understand your background.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "MENTOR",
        education: data.education || [],
        experience: data.experience || [],
        gender: data.gender,
        dob: data.dob,
        country: data.country,
        linkedin: data.linkedin,
        designation: data.designation,
        company: data.company,
        industry: data.industry,
        skills: data.skills || [],
        sessions: data.sessions || [],
        schedule: data.schedule || [],
        bio: bio,
        image: image
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultData = await res.json();

      if (!res.ok) {
        throw new Error(resultData.message || "Something went wrong during registration");
      }

      // Automatically sign in the newly created mentor
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Clear the temporary registration data
      clearData();

      // Redirect to Mentor Dashboard
      router.push("/mentor/dashboard");
      
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to S3/Cloudinary and get URL.
      // For now, we'll create an object URL or base64 for preview.
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={7} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Left Side: Profile Upload */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Upload Your Profile <span className="text-slate-400 font-normal text-lg">(Optional)</span>
            </h1>
            <p className="text-slate-500">Add a profile picture and bio to help others know you better.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full max-w-[200px] h-12 bg-white border border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-blue-600 font-medium text-sm">
                    <Upload className="w-4 h-4" />
                    Upload Picture
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">Bio (Optional)</label>
              <Textarea 
                placeholder="Tell others about yourself, your expertise, and what you enjoy mentoring..." 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl bg-slate-50 min-h-[160px] resize-none border-slate-200"
                maxLength={500}
              />
              <p className="text-[10px] text-right text-slate-400">{bio.length}/500</p>
            </div>
            
            <div className="mt-8 flex items-center pt-6 border-t border-slate-100">
              <Button variant="ghost" onClick={handleBack} className="rounded-xl h-12 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Review */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Review Your Details</h2>
            <p className="text-sm text-slate-500">Please review your information before creating account.</p>
          </div>
          
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Basic Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Basic Details</h3>
              <div className="text-sm text-slate-600">
                <p>{data.firstName} {data.lastName}</p>
                <p>{data.email}</p>
              </div>
            </div>
            
            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Education</h3>
              <div className="space-y-3">
                {data.education?.map((edu, idx) => (
                  <div key={idx} className="text-sm text-slate-600">
                    <p className="font-medium text-slate-800">{edu.highestQualification} in {edu.specialization}</p>
                    <p>{edu.college} | {edu.passingYear} | {edu.score}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Experience</h3>
              <div className="space-y-3">
                {data.experience?.map((exp, idx) => (
                  <div key={idx} className="text-sm text-slate-600">
                    <p className="font-medium text-slate-800">{exp.jobTitle} at {exp.company}</p>
                    <p>{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</p>
                    {exp.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Profile */}
            {(bio || image) && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Profile</h3>
                <div className="text-sm text-slate-600">
                  {bio && <p className="text-xs line-clamp-3 mb-2">{bio}</p>}
                  {image && <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-700">Image Attached</span>}
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Button 
              onClick={handleFinish} 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Finish & Create Account"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
