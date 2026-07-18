"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";
import { completeSession } from "@/actions/booking-actions";

interface CompleteSessionModalProps {
  bookingId: string | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteSessionModal({
  bookingId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: CompleteSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Rating 1-5
  const [performance, setPerformance] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  
  // Text feedback
  const [strength, setStrength] = useState("");
  const [weakness, setWeakness] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const handleSubmit = async () => {
    if (!bookingId) return;
    if (performance === 0 || communication === 0 || problemSolving === 0) {
      alert("Please provide ratings for all areas.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await completeSession(bookingId, {
        performance,
        communication,
        problemSolving,
        strength,
        weakness,
        recommendation
      });
      
      if (res.success) {
        onSuccess();
        onClose();
        // Reset state
        setPerformance(0);
        setCommunication(0);
        setProblemSolving(0);
        setStrength("");
        setWeakness("");
        setRecommendation("");
      } else {
        alert("Failed to mark session as completed.");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (value: number, setter: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            className={`focus:outline-none transition-colors ${
              star <= value ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-400/50"
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Session with {patientName}</DialogTitle>
          <DialogDescription>
            Provide your feedback and notes. This information will be used to generate the mentee's Career Roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Overall Performance</Label>
              {renderStars(performance, setPerformance)}
            </div>
            <div className="space-y-2">
              <Label>Communication Skills</Label>
              {renderStars(communication, setCommunication)}
            </div>
            <div className="space-y-2">
              <Label>Problem Solving</Label>
              {renderStars(problemSolving, setProblemSolving)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Strengths</Label>
              <Textarea 
                placeholder="What did the mentee do well?"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Areas for Improvement (Weaknesses)</Label>
              <Textarea 
                placeholder="Where should they focus their effort?"
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommendations / Action Items</Label>
              <Textarea 
                placeholder="Specific tasks or resources to review next..."
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
