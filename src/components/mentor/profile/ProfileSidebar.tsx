"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "resume", label: "Resume", action: "Update" },
  { id: "resume-headline", label: "Resume headline" },
  { id: "key-skills", label: "Key skills" },
  { id: "employment", label: "Employment" },
  { id: "education", label: "Education", action: "Add" },
  { id: "it-skills", label: "IT skills", action: "Add" },
  { id: "projects", label: "Projects", action: "Add" },
  { id: "profile-summary", label: "Profile summary" },
  { id: "accomplishments", label: "Accomplishments" },
  { id: "personal-details", label: "Personal details" },
];

export function ProfileSidebar() {
  const [activeSection, setActiveSection] = useState("resume");

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 150; // Offset for sticky header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for sticky header
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm sticky top-6">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">Quick links</h3>
      </div>
      <nav className="flex flex-col py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "text-left px-5 py-3 text-sm font-medium transition-colors border-l-2",
              activeSection === item.id
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span>{item.label}</span>
              {item.action && (
                <span className="text-xs font-semibold text-blue-600">
                  {item.action}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
