"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export function MentorSignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    
    setIsLoading(true);
    setError("");

    try {
      // 1. Create User and Mentor Profile
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password,
          role: "MENTOR"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong during registration");
      }

      // 2. Automatically sign in the newly created mentor
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error("Failed to automatically sign in after registration");
      }

      // 3. Redirect to Onboarding / Dashboard
      router.push("/mentor/apply");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
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

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-4 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 group transition-all duration-300 hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Apply as Mentor
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
