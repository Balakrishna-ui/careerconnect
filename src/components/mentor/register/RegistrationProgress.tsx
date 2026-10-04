"use client";

import { Check } from "lucide-react";

type Step = {
  id: number;
  label: string;
};

const steps: Step[] = [
  { id: 1, label: "Basic Details" },
  { id: 2, label: "Education" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Personal" },
  { id: 5, label: "Expertise" },
  { id: 6, label: "Offerings" },
  { id: 7, label: "Profile" },
];

export function RegistrationProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-10 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 -z-10" />
        
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : isActive 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                      : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span 
                className={`text-[11px] font-medium hidden sm:block ${
                  isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
