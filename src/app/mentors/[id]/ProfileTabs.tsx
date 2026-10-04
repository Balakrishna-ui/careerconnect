"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  reviewsCount: number;
}

export function ProfileTabs({ reviewsCount }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", targetId: "overview-section" },
    { id: "reviews", label: `Reviews (${reviewsCount})`, targetId: "reviews-section" },
    { id: "services", label: "Sessions & Services", targetId: "services-section" },
    { id: "experience", label: "Experience", targetId: "experience-section" },
    { id: "education", label: "Education", targetId: "education-section" },
    { id: "more", label: "More", targetId: "about-section" },
  ];

  const handleTabClick = (tabId: string, targetId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="border-b border-border/70 bg-background/95 backdrop-blur-md sticky top-14 z-30 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id, tab.targetId)}
              className={cn(
                "py-3.5 px-3 sm:px-5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer",
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
