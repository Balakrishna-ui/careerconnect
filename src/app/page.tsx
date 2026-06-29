"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Users,
  BriefcaseBusiness,
  Star,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const FADE_UP_ANIMATION_VARIANTS: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export default function Home() {
  return (
    <div className="flex flex-col bg-[#FAFBFF] overflow-hidden font-sans h-screen">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-screen w-full overflow-hidden pointer-events-none z-0">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Bottom wave curve */}
        <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-blue-50/80 to-transparent transform -skew-y-[2deg] origin-bottom-left" />
      </div>

      {/* Main Container - Exactly viewport height minus navbar (approx 64px) */}
      <main className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 h-[calc(100vh-64px)] w-full max-w-7xl">
        
        {/* Left Column - Copy & Actions */}
        <motion.div 
          className="flex-1 w-full max-w-xl xl:max-w-2xl flex flex-col justify-center"
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.h1 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.05] mb-3 xl:mb-5"
          >
            Accelerate Your Career<br />
            With<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block mt-1 pb-1">
              Verified Professionals
            </span>
          </motion.h1>
          
          <motion.p 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-sm md:text-base text-gray-600 max-w-md xl:max-w-lg mb-5 xl:mb-6 leading-relaxed font-medium"
          >
            Get 1-on-1 career guidance, mock interviews, and insider company insights directly from experienced mentors at top tech companies.
          </motion.p>

          {/* Stats Row */}
          <motion.div 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="flex flex-col sm:flex-row flex-wrap gap-3 xl:gap-5 mb-6 xl:mb-8"
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 bg-blue-100 rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-600" strokeWidth={3} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm xl:text-base">10,000+</p>
                <p className="text-xs text-gray-500 font-medium">Career Sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 bg-blue-100 rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-600" strokeWidth={3} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm xl:text-base">500+</p>
                <p className="text-xs text-gray-500 font-medium">Verified Mentors</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 bg-blue-100 rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-600" strokeWidth={3} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm xl:text-base">Mentors from</p>
                <p className="text-xs text-gray-500 font-medium">Google, Microsoft, Amazon</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="flex flex-col sm:flex-row gap-3 xl:gap-4"
          >
            <Link 
              href="/mentors" 
              className="group flex items-center justify-between sm:justify-start gap-3 bg-[#1e40af] hover:bg-blue-800 text-white rounded-[1.2rem] p-2.5 xl:p-3 pr-4 xl:pr-5 transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 w-full sm:w-auto"
            >
              <div className="bg-white/20 p-2 xl:p-2.5 rounded-xl backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col items-start pr-2">
                <p className="font-bold text-sm xl:text-base mb-0.5">Find a Mentor</p>
                <p className="text-xs font-semibold text-blue-200 flex items-center group-hover:text-white transition-colors">
                  Get Started <ArrowRight className="w-3 h-3 xl:w-3.5 xl:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>

            <Link 
              href="/signup" 
              className="group flex items-center justify-between sm:justify-start gap-3 bg-white hover:bg-gray-50 text-gray-900 rounded-[1.2rem] p-2.5 xl:p-3 pr-4 xl:pr-5 transition-all duration-300 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/70 border border-gray-100 hover:-translate-y-1 w-full sm:w-auto"
            >
              <div className="bg-gray-100 p-2 xl:p-2.5 rounded-xl">
                <BriefcaseBusiness className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex flex-col items-start pr-2">
                <p className="font-bold text-sm xl:text-base mb-0.5">Become a Mentor</p>
                <p className="text-xs font-semibold text-gray-500 flex items-center group-hover:text-gray-900 transition-colors">
                  Get Started <ArrowRight className="w-3 h-3 xl:w-3.5 xl:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column - Hero Graphic (Scaled to fit height) */}
        <div className="flex-1 w-full relative h-[60vh] min-h-[400px] hidden md:block mt-0 transform origin-center flex items-center justify-center">
          
          <div className="relative w-full max-w-[600px] aspect-square transform scale-[0.7] lg:scale-[0.75] xl:scale-[0.8]">
            {/* Decorative curved SVG line (approximation) */}
            <svg className="absolute inset-0 w-full h-full text-indigo-100 -z-10" viewBox="0 0 500 500" preserveAspectRatio="none">
              <path d="M50,100 Q150,0 300,50 T450,200 T300,400" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="50" cy="100" r="6" fill="#e0e7ff" />
              <circle cx="300" cy="50" r="6" fill="#e0e7ff" />
              <circle cx="450" cy="200" r="6" fill="#e0e7ff" />
              <circle cx="300" cy="400" r="6" fill="#e0e7ff" />
            </svg>

            {/* Dotted squares decoration */}
            <div className="absolute top-[5%] left-[5%] grid grid-cols-4 gap-2 opacity-20 -z-10">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Top Blue Card */}
              <div className="absolute top-[10%] left-[5%] w-[260px] lg:w-[300px] aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-2xl shadow-blue-900/30 z-20 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Find a Mentor</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Connect with verified professionals from top companies for guidance and interview prep.
                </p>
                <div className="flex items-center text-sm font-bold text-white group cursor-pointer w-fit">
                  Get Started <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Bottom White Card */}
              <div className="absolute top-[45%] left-[40%] w-[260px] lg:w-[300px] aspect-square bg-white rounded-[2rem] p-6 text-gray-900 shadow-2xl shadow-gray-300/50 z-30 flex flex-col justify-center border border-gray-50">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                  <BriefcaseBusiness className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Become a Mentor</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Share your expertise, help aspiring professionals accelerate their careers, and get paid.
                </p>
                <div className="flex items-center text-sm font-bold text-gray-900 group cursor-pointer w-fit">
                  Get Started <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-[5%] left-[65%] bg-white rounded-full px-4 py-2 shadow-xl shadow-gray-200/50 flex items-center gap-2 z-40">
                <div className="bg-amber-100 p-1.5 rounded-full"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /></div>
                <div>
                  <p className="text-sm font-bold leading-tight">4.9/5</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Rating</p>
                </div>
              </div>

              <div className="absolute top-[35%] left-[80%] bg-white rounded-full px-4 py-2 shadow-xl shadow-gray-200/50 flex items-center gap-2 z-40">
                <div className="bg-blue-100 p-1.5 rounded-full"><Users className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-bold leading-tight">500+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Mentors</p>
                </div>
              </div>

              <div className="absolute top-[65%] left-[-5%] bg-white rounded-full px-4 py-2 shadow-xl shadow-gray-200/50 flex items-center gap-2 z-40">
                <div className="bg-indigo-100 p-1.5 rounded-full"><TrendingUp className="w-4 h-4 text-indigo-600" /></div>
                <div>
                  <p className="text-sm font-bold leading-tight">10K+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Sessions</p>
                </div>
              </div>

              <div className="absolute top-[85%] left-[75%] bg-white rounded-full px-4 py-2 shadow-xl shadow-gray-200/50 flex items-center gap-2 z-40">
                <div className="bg-purple-100 p-1.5 rounded-full"><BarChart3 className="w-4 h-4 text-purple-600" /></div>
                <div>
                  <p className="text-sm font-bold leading-tight">95%</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Success Rate</p>
                </div>
              </div>
              
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
