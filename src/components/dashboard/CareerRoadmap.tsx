"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, CheckCircle2, ChevronRight, Loader2, BookOpen, Target, LayoutTemplate } from "lucide-react";
import { generateSessionSummary } from "@/actions/booking-actions";

export function CareerRoadmap({
  bookingId,
  sessionNotes,
  sessionSummary,
  tasks
}: {
  bookingId: string;
  sessionNotes: any;
  sessionSummary: any;
  tasks: any[];
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(sessionSummary);
  const [mentorTasks, setMentorTasks] = useState(tasks);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateSessionSummary(bookingId);
      if (res.success) {
        setSummary(res.summary);
        setMentorTasks(res.tasks);
      } else {
        alert("Failed to generate AI roadmap");
      }
    } catch (e) {
      alert("Error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!sessionNotes) {
    return null; // Session not completed or no notes yet
  }

  if (!summary) {
    return (
      <Card className="shadow-sm border-emerald-200 bg-emerald-50/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-emerald-600" />
        </div>
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> AI Career Roadmap Ready
          </CardTitle>
          <CardDescription className="text-emerald-700/80">
            Your mentor has provided feedback. We can now generate a personalized career roadmap based on their notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate My Roadmap</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-emerald-500" /> Your Career Roadmap
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Areas to Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {summary.missingSkills || "No specific missing skills mentioned."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-emerald-500" /> Suggested Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {summary.projectsToBuild || "No specific projects suggested."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Key Takeaways & Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {summary.interviewTips}
          </p>
        </CardContent>
      </Card>

      {mentorTasks && mentorTasks.length > 0 && (
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Follow-up Tasks</CardTitle>
            <CardDescription>Action items generated from your session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentorTasks.map((task: any) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
