"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProgress } from "@/components/mentor/register/RegistrationProgress";
import { useMentorRegistration } from "@/hooks/useMentorRegistration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

const SESSION_TYPES = [
  "Career Guidance", "Resume Review", "Mock Interview", "Career Switch",
  "Promotion Guidance", "System Design Interview", "Portfolio Review",
  "HR Interview", "Technical Interview", "Salary Negotiation",
  "LinkedIn Profile Review", "Career Roadmap", "Coding Session",
  "Freelancing Guidance"
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function OfferingsPage() {
  const router = useRouter();
  const { data, updateData } = useMentorRegistration();
  
  const [sessions, setSessions] = useState<any[]>(
    data.sessions && data.sessions.length > 0
      ? data.sessions
      : [{ id: Date.now().toString(), type: "", duration: 30, price: "" }]
  );

  const [schedule, setSchedule] = useState<any[]>(
    data.schedule && data.schedule.length > 0
      ? data.schedule
      : DAYS.map((day, i) => ({ dayOfWeek: i, name: day, isAvailable: false, startTime: "09:00", endTime: "17:00" }))
  );

  const handleAddSession = () => {
    setSessions([...sessions, { id: Date.now().toString(), type: "", duration: 30, price: "" }]);
  };

  const handleRemoveSession = (id: string) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  const handleSessionChange = (id: string, field: string, value: any) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleScheduleChange = (dayIndex: number, field: string, value: any) => {
    setSchedule(schedule.map(d => d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d));
  };

  const handleNext = () => {
    const validSessions = sessions.filter(s => s.type && s.price);
    if (validSessions.length === 0) {
      alert("Please configure at least one mentorship session with a valid type and price.");
      return;
    }
    
    const hasAvailability = schedule.some(d => d.isAvailable);
    if (!hasAvailability) {
      alert("Please select at least one day of availability in your schedule.");
      return;
    }
    
    updateData({ sessions: validSessions, schedule });
    router.push("/mentor-register/profile");
  };

  const handleBack = () => {
    updateData({ sessions, schedule });
    router.push("/mentor-register/expertise");
  };

  return (
    <div className="w-full">
      <RegistrationProgress currentStep={6} />
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Mentorship Offerings</h1>
          <p className="text-slate-500">Configure what sessions you offer and when you're available.</p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">1. Session Types *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSession}>
                <Plus className="w-4 h-4 mr-2" /> Add Session
              </Button>
            </div>
            
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div key={session.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative flex flex-col md:flex-row gap-4 items-end">
                  {sessions.length > 1 && (
                    <button 
                      onClick={() => handleRemoveSession(session.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="space-y-2 flex-1 w-full">
                    <Label className="text-xs">Session Type</Label>
                    <select 
                      value={session.type}
                      onChange={(e) => handleSessionChange(session.id, "type", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">Select type...</option>
                      {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2 w-full md:w-32">
                    <Label className="text-xs">Duration (mins)</Label>
                    <select 
                      value={session.duration}
                      onChange={(e) => handleSessionChange(session.id, "duration", parseInt(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 w-full md:w-32">
                    <Label className="text-xs">Price (₹)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 500"
                      value={session.price}
                      onChange={(e) => handleSessionChange(session.id, "price", e.target.value)}
                      className="h-10 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Label className="text-lg font-semibold mb-4 block">2. Weekly Availability *</Label>
            <div className="space-y-3">
              {schedule.map((day) => (
                <div key={day.dayOfWeek} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 w-32 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={day.isAvailable}
                      onChange={(e) => handleScheduleChange(day.dayOfWeek, "isAvailable", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="font-medium text-sm text-slate-700">{day.name}</span>
                  </div>
                  
                  {day.isAvailable && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input 
                        type="time" 
                        value={day.startTime}
                        onChange={(e) => handleScheduleChange(day.dayOfWeek, "startTime", e.target.value)}
                        className="h-9 w-32"
                      />
                      <span className="text-slate-400 text-sm">to</span>
                      <Input 
                        type="time" 
                        value={day.endTime}
                        onChange={(e) => handleScheduleChange(day.dayOfWeek, "endTime", e.target.value)}
                        className="h-9 w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="h-12 px-6 rounded-xl border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
