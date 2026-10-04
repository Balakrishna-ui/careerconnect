"use client";

import { useState } from "react";
import { Share2, Check, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";

export function ShareProfileButton({ mentorName }: { mentorName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${mentorName} - Mentor on CareerConnect`,
              text: `Check out ${mentorName}'s mentor profile on CareerConnect`,
              url,
            });
            return;
          } catch (err: any) {
            if (err.name !== "AbortError") {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              toast.success("Profile link copied to clipboard!");
              setTimeout(() => setCopied(false), 2000);
            }
          }
        } else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Profile link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="h-9 px-3.5 rounded-lg border-border/80 bg-background hover:bg-muted text-foreground text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
      Share Profile
    </Button>
  );
}

export function SaveMentorButton({
  mentorId,
  isInitiallySaved = false,
  isAuthenticated,
}: {
  mentorId: string;
  isInitiallySaved?: boolean;
  isAuthenticated: boolean;
}) {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/saved-mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
        if (data.saved) {
          toast.success("Mentor saved to your list!");
        } else {
          toast.info("Mentor removed from saved list");
        }
      } else {
        toast.error(data.message || "Failed to update saved status");
      }
    } catch {
      toast.error("Network error while saving mentor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleSave}
        disabled={isLoading}
        className={cn(
          "h-9 px-3.5 rounded-lg border-border/80 bg-background text-xs font-semibold gap-1.5 shadow-xs transition-colors cursor-pointer",
          isSaved
            ? "border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900"
            : "hover:bg-muted text-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              isSaved ? "fill-rose-500 text-rose-500" : "text-rose-500"
            )}
          />
        )}
        {isSaved ? "Saved" : "Save Mentor"}
      </Button>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        callbackUrl={typeof window !== "undefined" ? window.location.pathname : `/mentors/${mentorId}`}
      />
    </>
  );
}
