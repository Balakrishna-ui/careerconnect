"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BriefcaseBusiness, Loader2, Users, CalendarCheck, GraduationCap, 
  Star, IndianRupee, TrendingUp, ArrowRight, User, Mail, Lock, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorSignupForm } from "./MentorSignupForm";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("jobseeker");
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState<"signup" | "login" | "forgotPassword">("signup");
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('type') === 'mentor') {
        setActiveTab('mentor');
      }
      if (urlParams.get('view') === 'login') {
        setViewMode('login');
      }
      if (urlParams.get('callbackUrl')) {
        setCallbackUrl(urlParams.get('callbackUrl'));
      }
      
      const errorMsgParam = urlParams.get('error_msg');
      if (errorMsgParam) {
        setError(errorMsgParam);
      } else {
        const errorParam = urlParams.get('error');
        if (errorParam) {
          if (errorParam === 'OAuthAccountNotLinked') {
            setError('Email already in use with a different provider.');
          } else if (errorParam === 'OAuthCallback' || errorParam === 'OAuthSignin') {
            setError('Authentication failed or was cancelled.');
          } else {
            setError(errorParam);
          }
        }
      }
    }

    const handleOpenLogin = () => setViewMode('login');
    window.addEventListener('openLogin', handleOpenLogin);
    return () => window.removeEventListener('openLogin', handleOpenLogin);
  }, []);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "An error occurred during registration");
        setIsLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Registration successful, but login failed. Please sign in manually.");
        setIsLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl');
        
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (session?.user?.role === "MENTOR") {
          router.push("/mentor/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        role: activeTab === 'mentor' ? 'MENTOR' : 'JOB_SEEKER',
        redirect: false,
      });

      if (res?.error) {
        const errorMessage = res.error === 'CredentialsSignin' 
          ? "Invalid email or password." 
          : res.error;
        setError(errorMessage);
        setIsLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl');
        
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (session?.user?.role === "MENTOR") {
          router.push("/mentor/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate forgot password API call
    setTimeout(() => {
      setError("If an account exists with this email, a reset link has been sent.");
      setIsLoading(false);
    }, 1000);
  };

  const fadeVariants = {
    initial: { opacity: 0, x: 10, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -10, scale: 0.98 }
  };

  const renderSocialLogins = () => (
    <>
      <div className="relative mt-3 mb-2.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-medium">
          <span className="bg-white px-3 text-slate-400">
            {viewMode === "signup" ? "Or sign up with" : "Or continue with"}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-2.5">
        <Button variant="outline" type="button" onClick={() => { document.cookie = `oauth_role=${activeTab}; path=/; max-age=300;`; signIn("google", { callbackUrl: callbackUrl || "/api/auth/success" }); }} className="w-full h-11 rounded-2xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
          <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button" onClick={() => { document.cookie = `oauth_role=${activeTab}; path=/; max-age=300;`; signIn("github", { callbackUrl: callbackUrl || "/api/auth/success" }); }} className="w-full h-11 rounded-2xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
          <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </Button>
      </div>
    </>
  );

  return (
    <div className="h-[100dvh] w-screen flex flex-col lg:flex-row font-sans overflow-hidden bg-white">
        
        {/* Left Side (Dark Theme Feature Presentation) */}
        <div className="relative hidden lg:flex flex-col w-full lg:w-[55%] bg-gradient-to-br from-[#08142F] to-[#1E3A8A] px-[clamp(24px,4vw,48px)] py-[clamp(24px,3vh,48px)] xl:px-[64px] xl:py-[40px] text-white overflow-hidden shrink-0">
          {/* Subtle background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header / Logo */}
            <div className="flex items-center gap-3 mb-[clamp(1rem,2vh,2rem)]">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                <BriefcaseBusiness className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="font-extrabold text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight">
                CareerConnect
              </span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 w-fit mb-[clamp(1rem,2.5vh,1.5rem)] backdrop-blur-sm">
              <Star className="h-3 w-3 md:h-4 md:w-4 text-blue-400 fill-blue-400" />
              <span className="text-[clamp(0.75rem,1.2vw,0.875rem)] font-medium text-blue-200">India's #1 Mentorship Platform</span>
            </div>

            {/* Typography */}
            <div className="space-y-[clamp(0.4rem,1vh,0.5rem)] mb-[clamp(1rem,3vh,1.5rem)]">
              <h1 className="text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold leading-[1.15] tracking-tight">
                Share Your Knowledge.<br />
                <span className="text-blue-500">Inspire</span> the Next Generation.
              </h1>
              <p className="text-[clamp(0.85rem,1.3vw,1rem)] text-slate-300 max-w-md leading-relaxed">
                Join thousands of professionals who are making a real impact through mentorship.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-x-[clamp(1rem,2vw,1.5rem)] gap-y-[clamp(0.75rem,1.5vh,1.25rem)] mb-auto">
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-blue-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Flexible Mentoring</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">Mentor on your own terms</p>
                </div>
              </div>
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-emerald-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <CalendarCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Set Your Schedule</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">Choose when you want to mentor</p>
                </div>
              </div>
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-indigo-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Impact Careers</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">Help mentees achieve their goals</p>
                </div>
              </div>
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-amber-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-amber-400 fill-amber-400/20" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Build Your Brand</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">Grow your professional reputation</p>
                </div>
              </div>
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-purple-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <IndianRupee className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Earn & Grow</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">Monetize your expertise</p>
                </div>
              </div>
              <div className="flex gap-[clamp(0.5rem,1vw,1rem)]">
                <div className="mt-1 bg-rose-500/20 p-[clamp(0.4rem,0.8vw,0.625rem)] rounded-xl h-fit shrink-0">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[clamp(0.875rem,1.2vw,1rem)] text-slate-100 mb-0.5">Track Your Impact</h3>
                  <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-400">See the difference you make</p>
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="mt-auto bg-white/10 border border-white/20 rounded-2xl p-4 h-[100px] backdrop-blur-lg relative overflow-hidden shrink-0 shadow-2xl flex items-center">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-400" />
              <div className="flex gap-4 items-center w-full">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100" 
                  alt="Rahul Sharma" 
                  className="h-12 w-12 rounded-full border-2 border-slate-300/50 object-cover shrink-0"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-[13px] text-slate-300 italic leading-snug mb-1 line-clamp-2">
                    "Mentoring on CareerConnect has been incredibly rewarding. I've helped dozens of junior engineers level up their careers."
                  </p>
                  <div className="flex items-center gap-1.5 text-xs truncate">
                    <span className="font-semibold text-slate-100">— Rahul Sharma</span>
                    <span className="text-slate-400 truncate">· Senior Software Engineer @ Google</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-[45%] px-[clamp(24px,4vw,64px)] py-[clamp(16px,2vh,24px)] flex flex-col justify-center bg-white relative overflow-y-auto shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-10 shrink-0">
          <div className="mx-auto w-full max-w-[480px]">
            
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center mb-6 gap-2">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BriefcaseBusiness className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-[clamp(1.25rem,4vw,1.5rem)] tracking-tight">CareerConnect</span>
            </div>

            <div className="flex flex-col space-y-[clamp(2px,0.8vh,6px)] text-center mb-[clamp(0.5rem,1.5vh,1rem)] min-h-[4rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode + activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-[clamp(1.35rem,2.8vw,1.75rem)] font-bold tracking-tight text-slate-900">
                    {viewMode === "signup" ? (
                      <>Create your <span className="text-blue-600">{activeTab === 'mentor' ? 'mentor' : 'account'}</span></>
                    ) : viewMode === "login" ? (
                      <>{activeTab === 'mentor' ? "Mentor Login" : "Welcome Back"}</>
                    ) : (
                      <>Forgot Password</>
                    )}
                  </h2>
                  <p className="text-[clamp(0.8rem,1.2vw,0.875rem)] text-slate-500 mt-1">
                    {viewMode === "signup" 
                      ? "Start your journey with CareerConnect" 
                      : viewMode === "login"
                      ? (activeTab === 'mentor' ? "Access your mentor dashboard" : "Login to your CareerConnect account")
                      : "Enter your email to reset your password"
                    }
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {viewMode !== "forgotPassword" && (
                <TabsList className="flex w-fit mx-auto mb-[clamp(0.5rem,1.5vh,1rem)] bg-slate-100 p-1 rounded-full">
                  <TabsTrigger
                    value="jobseeker"
                    className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 hover:text-slate-700 gap-2 flex items-center"
                  >
                    <BriefcaseBusiness className="h-4 w-4" /> Job Seeker
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentor"
                    className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 hover:text-slate-700 gap-2 flex items-center"
                  >
                    <GraduationCap className="h-4 w-4" /> Mentor
                  </TabsTrigger>
                </TabsList>
              )}
            
              <AnimatePresence mode="wait">
                {viewMode === "signup" && (
                  <motion.div
                    key="signup"
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <TabsContent value="jobseeker" className="mt-0 outline-none">
                      <div className="grid gap-3">
                        <form onSubmit={handleSignupSubmit}>
                          <div className="grid gap-2.5">
                            {error && activeTab === 'jobseeker' && (
                              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="grid gap-1.5">
                                <Label htmlFor="first-name" className="text-xs text-slate-500 font-medium ml-1">First name</Label>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input 
                                    id="first-name" 
                                    placeholder="Jane" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required={activeTab === 'jobseeker'}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
                                  />
                                </div>
                              </div>
                              <div className="grid gap-1.5">
                                <Label htmlFor="last-name" className="text-xs text-slate-500 font-medium ml-1">Last name</Label>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input 
                                    id="last-name" 
                                    placeholder="Smith" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required={activeTab === 'jobseeker'}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor="email" className="text-xs text-slate-500 font-medium ml-1">Email Address</Label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  id="email" 
                                  placeholder="jane@google.com" 
                                  type="email" 
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required={activeTab === 'jobseeker'}
                                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
                                />
                              </div>
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor="password" className="text-xs text-slate-500 font-medium ml-1">Password</Label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  id="password" 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="••••••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required={activeTab === 'jobseeker'}
                                  minLength={8}
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
                            <Button className="w-full mt-1.5 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 group transition-all duration-300 hover:-translate-y-0.5" type="submit" disabled={isLoading}>
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Create Account
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            
                            <div className="flex flex-col space-y-2.5 mt-2">
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-medium">
                                  <span className="bg-white px-3 text-slate-400">
                                    Already have an account?
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => { setError(""); setViewMode("login"); }}
                                variant="outline"
                                className="w-full h-11 rounded-2xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 group"
                              >
                                Login as Job Seeker
                                <ArrowRight className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                              </Button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="mentor" className="mt-0 outline-none">
                      <div className="grid gap-3">
                        <MentorSignupForm />
                        <div className="flex flex-col space-y-2.5 mt-0">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-medium">
                              <span className="bg-white px-3 text-slate-400">
                                Already have an account?
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => { setError(""); setViewMode("login"); }}
                            variant="outline"
                            className="w-full h-12 rounded-2xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 group"
                          >
                            Login as Mentor
                            <ArrowRight className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    {renderSocialLogins()}
                  </motion.div>
                )}

                {viewMode === "login" && (
                  <motion.div
                    key="login"
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="grid gap-3">
                      <form onSubmit={handleLoginSubmit}>
                        <div className="grid gap-2.5">
                          {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                              {error}
                            </div>
                          )}
                          <div className="grid gap-1.5">
                            <Label htmlFor="login-email" className="text-xs text-slate-500 font-medium ml-1">
                              {activeTab === 'mentor' ? "Registered Email" : "Email Address"}
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input 
                                id="login-email" 
                                placeholder="name@example.com" 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
                              />
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <div className="flex items-center justify-between ml-1">
                              <Label htmlFor="login-password" className="text-xs text-slate-500 font-medium">Password</Label>
                              <button 
                                type="button" 
                                onClick={() => { setError(""); setViewMode("forgotPassword"); }} 
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                Forgot Password?
                              </button>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input 
                                id="login-password" 
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
                          <Button className="w-full mt-1.5 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 group transition-all duration-300 hover:-translate-y-0.5" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          
                          <div className="flex flex-col space-y-2.5 mt-2">
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                              </div>
                              <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-medium">
                                <span className="bg-white px-3 text-slate-400">
                                  {activeTab === 'mentor' ? "Don't have a mentor account?" : "Don't have an account?"}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => { setError(""); setViewMode("signup"); }}
                              variant="outline"
                              className="w-full h-11 rounded-2xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 group"
                            >
                              {activeTab === 'mentor' ? "Apply as Mentor" : "Create Account"}
                              <ArrowRight className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                    {renderSocialLogins()}
                  </motion.div>
                )}

                {viewMode === "forgotPassword" && (
                  <motion.div
                    key="forgotPassword"
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="grid gap-3">
                      <form onSubmit={handleForgotPasswordSubmit}>
                        <div className="grid gap-2.5">
                          {error && (
                            <div className={`p-3 text-sm rounded-md border ${error.includes('sent') ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                              {error}
                            </div>
                          )}
                          <div className="grid gap-1.5">
                            <Label htmlFor="forgot-email" className="text-xs text-slate-500 font-medium ml-1">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input 
                                id="forgot-email" 
                                placeholder="name@example.com" 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/50 shadow-sm rounded-2xl transition-all duration-200"
                              />
                            </div>
                          </div>
                          <Button className="w-full mt-1.5 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20 group transition-all duration-300 hover:-translate-y-0.5" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Send Reset Link
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => { setError(""); setViewMode("login"); }}
                            variant="ghost"
                            className="w-full mt-2 h-11 rounded-2xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 group"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:-translate-x-1" />
                            Back to Login
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>

          <p className="px-8 mt-6 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          </div>
        </div>
      </div>
  );
}
