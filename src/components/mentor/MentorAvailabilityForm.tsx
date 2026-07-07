"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
];

export function MentorAvailabilityForm() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const res = await fetch("/api/mentor/availability");
      if (res.ok) {
        const data = await res.json();
        const serverSchedules = data.weeklySchedules || [];
        
        // Initialize state with server data or defaults
        const initialSchedules = DAYS.map(day => {
          const existing = serverSchedules.find((s: any) => s.dayOfWeek === day.id);
          return existing || {
            dayOfWeek: day.id,
            isAvailable: day.id > 0 && day.id < 6, // Mon-Fri default true
            startTime: "09:00",
            endTime: "17:00",
          };
        });
        setSchedules(initialSchedules);
      }
    } catch (err) {
      console.error("Failed to load availability", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggle = (dayId: number, checked: boolean) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === dayId ? { ...s, isAvailable: checked } : s));
  };

  const handleTimeChange = (dayId: number, field: "startTime" | "endTime", value: string) => {
    setSchedules(prev => prev.map(s => s.dayOfWeek === dayId ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedules),
      });
      
      if (res.ok) {
        setMessage("Availability updated successfully!");
      } else {
        setMessage("Failed to update availability.");
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Set your weekly recurring schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-3 text-sm rounded-md ${message.includes("success") ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            {DAYS.map((day) => {
              const schedule = schedules.find(s => s.dayOfWeek === day.id);
              if (!schedule) return null;
              
              return (
                <div key={day.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                  <div className="flex items-center gap-3 w-40">
                    <Switch 
                      checked={schedule.isAvailable} 
                      onCheckedChange={(c) => handleToggle(day.id, c)} 
                    />
                    <Label className="font-medium cursor-pointer" onClick={() => handleToggle(day.id, !schedule.isAvailable)}>
                      {day.label}
                    </Label>
                  </div>
                  
                  {schedule.isAvailable ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={schedule.startTime} 
                        onChange={(e) => handleTimeChange(day.id, "startTime", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input 
                        type="time" 
                        value={schedule.endTime} 
                        onChange={(e) => handleTimeChange(day.id, "endTime", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic flex-1 text-right">
                      Unavailable
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto mt-4">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Availability
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
