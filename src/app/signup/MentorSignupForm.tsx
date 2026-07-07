"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function MentorSignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    
    // Redirect to the mentor application flow and prefill Step 1 using query parameters
    const params = new URLSearchParams({
      firstName,
      lastName,
      email,
      password // Passing password via URL is generally unsafe, but we're mimicking the flow for the mock wizard.
    });
    router.push(`/mentor/apply?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-first-name" className="text-xs text-slate-500 font-medium ml-1">First name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="m-first-name" 
                placeholder="Jane" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                required 
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-last-name" className="text-xs text-slate-500 font-medium ml-1">Last name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="m-last-name" 
                placeholder="Smith" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                required 
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="work-email" className="text-xs text-slate-500 font-medium ml-1">Work Email (Required for Verification)</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              id="work-email" 
              placeholder="jane@google.com" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="m-password" className="text-xs text-slate-500 font-medium ml-1">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              id="m-password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl tracking-widest transition-all duration-200"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full mt-4 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 group transition-all duration-300 hover:-translate-y-0.5">
          Apply as Mentor
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
}
