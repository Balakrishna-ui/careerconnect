"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Search, ChevronDown, ChevronUp, X, Star, RotateCcw, SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Static data for filter options ───────────────────────────────────────────
const EXP_OPTIONS = ["0-2 Years", "2-5 Years", "5-8 Years", "8-12 Years", "12+ Years"];
const EXP_KEYS    = ["0-2", "2-5", "5-8", "8-12", "12+"];

const COMPANY_OPTIONS = [
  "Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft", "Adobe",
  "Salesforce", "Stripe", "Airbnb", "Razorpay", "Swiggy", "Zomato",
  "Flipkart", "Deloitte", "EY", "PwC", "KPMG", "Infosys", "TCS",
];
const ROLE_OPTIONS = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", 
  "Principal Engineer", "Engineering Manager", "Product Manager",
  "Data Scientist", "Data Analyst", "ML Engineer", "UX Designer",
  "DevOps Engineer", "Cloud Architect", "SAP Consultant", "Business Analyst",
];
const SKILL_OPTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
  "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
  "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
  "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain",
  "Leadership", "Negotiation", "Career Growth", "Mock Interview", "Resume Review"
].sort();
const INDUSTRY_OPTIONS = [
  "IT Services", "Product Based", "Consulting", "Banking", "Healthcare",
  "FinTech", "E-Commerce", "EdTech",
];
const GOAL_OPTIONS = [
  "Resume Review", "Mock Interview", "Career Switch", "Promotion Guidance",
  "Salary Negotiation", "Leadership Coaching", "MBA Guidance", "Study Abroad",
];
const TIER_OPTIONS = [
  "FAANG", "Big Tech", "Consulting", "Unicorn Startups", "IT Services",
];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi"];
const LOCATION_OPTIONS = ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi", "Gurgaon", "Remote"];
const RATING_OPTIONS = [
  { label: "4.5+ ⭐", value: "4.5" },
  { label: "4.0+ ⭐", value: "4.0" },
  { label: "3.5+ ⭐", value: "3.5" },
];

// ─── Filter Section Component ──────────────────────────────────────────────────
interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ─── Searchable Multi-select ───────────────────────────────────────────────────
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  searchable?: boolean;
  counts?: Record<string, number>;
}
function MultiSelect({ options, selected, onToggle, searchable, counts }: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const visible = searchable
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;
  return (
    <div>
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-7 h-8 text-xs bg-muted/40 border-border/50"
          />
        </div>
      )}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {visible.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2.5 cursor-pointer group py-0.5"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="rounded border-border text-primary accent-blue-600 w-3.5 h-3.5 flex-shrink-0"
            />
            <span className={cn(
              "text-sm transition-colors flex-1 leading-tight",
              selected.includes(opt)
                ? "text-foreground font-medium"
                : "text-muted-foreground group-hover:text-foreground"
            )}>
              {opt}
            </span>
            {counts && counts[opt] !== undefined && (
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                ({counts[opt]})
              </span>
            )}
          </label>
        ))}
        {visible.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No results</p>
        )}
      </div>
    </div>
  );
}

// ─── Price Slider ──────────────────────────────────────────────────────────────
interface PriceSliderProps {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}
function PriceSlider({ min, max, value, onChange }: PriceSliderProps) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <span>₹{value[0].toLocaleString()}</span>
        <span>₹{value[1].toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs w-6">Min</span>
          <input
            type="range" min={min} max={max} step={100}
            value={value[0]}
            onChange={(e) => onChange([Number(e.target.value), value[1]])}
            className="flex-1 accent-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-6">Max</span>
          <input
            type="range" min={min} max={max} step={100}
            value={value[1]}
            onChange={(e) => onChange([value[0], Number(e.target.value)])}
            className="flex-1 accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Filter Sidebar ───────────────────────────────────────────────────────
export interface FilterState {
  experience: string[];
  companies: string[];
  roles: string[];
  skills: string[];
  industries: string[];
  goals: string[];
  priceRange: [number, number];
  minRating: string;
  companyTiers: string[];
  languages: string[];
  locations: string[];
  remoteAvailable: boolean;
  verified: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  counts?: {
    companies: { name: string; count: number }[];
    industries: { name: string; count: number }[];
    tiers: { name: string; count: number }[];
    locations: { name: string; count: number }[];
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterSidebar({
  filters, onFiltersChange, counts,
  mobileOpen, onMobileClose
}: FilterSidebarProps) {
  const makeCompanyCounts = () => {
    if (!counts) return {};
    return Object.fromEntries(counts.companies.map((c) => [c.name, c.count]));
  };
  const makeIndustryCounts = () => {
    if (!counts) return {};
    return Object.fromEntries(counts.industries.map((c) => [c.name, c.count]));
  };

  const toggle = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    onFiltersChange({
      ...filters,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const totalActive =
    filters.experience.length + filters.companies.length + filters.roles.length +
    filters.skills.length + filters.industries.length + filters.goals.length +
    filters.companyTiers.length + filters.languages.length + filters.locations.length +
    (filters.verified ? 1 : 0) + (filters.remoteAvailable ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  const sidebarContent = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Filters</span>
          {totalActive > 0 && (
            <Badge className="bg-primary/10 text-primary text-xs border-0 px-1.5 py-0 rounded-full">
              {totalActive}
            </Badge>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={() => onFiltersChange({
              experience: [], companies: [], roles: [], skills: [], industries: [],
              goals: [], priceRange: [0, 5000], minRating: "",
              companyTiers: [], languages: [], locations: [],
              remoteAvailable: false, verified: false,
            })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <FilterSection title="Experience" defaultOpen={true}>
        <div className="space-y-1.5">
          {EXP_OPTIONS.map((label, i) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                checked={filters.experience.includes(EXP_KEYS[i])}
                onChange={() => toggle("experience", EXP_KEYS[i])}
                className="rounded border-border accent-blue-600 w-3.5 h-3.5"
              />
              <span className={cn("text-sm transition-colors",
                filters.experience.includes(EXP_KEYS[i])
                  ? "text-foreground font-medium"
                  : "text-muted-foreground group-hover:text-foreground"
              )}>{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Current Company" defaultOpen={true}>
        <MultiSelect
          options={COMPANY_OPTIONS}
          selected={filters.companies}
          onToggle={(v) => toggle("companies", v)}
          searchable
          counts={makeCompanyCounts()}
        />
      </FilterSection>

      <FilterSection title="Role / Designation" defaultOpen={false}>
        <MultiSelect
          options={ROLE_OPTIONS}
          selected={filters.roles}
          onToggle={(v) => toggle("roles", v)}
          searchable
        />
      </FilterSection>

      <FilterSection title="Skills" defaultOpen={true}>
        <MultiSelect
          options={SKILL_OPTIONS}
          selected={filters.skills}
          onToggle={(v) => toggle("skills", v)}
          searchable
        />
      </FilterSection>

      <FilterSection title="Industry" defaultOpen={false}>
        <MultiSelect
          options={INDUSTRY_OPTIONS}
          selected={filters.industries}
          onToggle={(v) => toggle("industries", v)}
          counts={makeIndustryCounts()}
        />
      </FilterSection>

      <FilterSection title="Career Goals" defaultOpen={false}>
        <MultiSelect
          options={GOAL_OPTIONS}
          selected={filters.goals}
          onToggle={(v) => toggle("goals", v)}
        />
      </FilterSection>

      <FilterSection title="Session Price (₹)" defaultOpen={true}>
        <PriceSlider
          min={0} max={5000}
          value={filters.priceRange}
          onChange={(v) => onFiltersChange({ ...filters, priceRange: v })}
        />
      </FilterSection>

      <FilterSection title="Mentor Rating" defaultOpen={true}>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === opt.value}
                onChange={() => onFiltersChange({
                  ...filters,
                  minRating: filters.minRating === opt.value ? "" : opt.value
                })}
                className="border-border accent-blue-600 w-3.5 h-3.5"
              />
              <span className={cn("text-sm transition-colors",
                filters.minRating === opt.value ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
              )}>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Company Tier" defaultOpen={false}>
        <MultiSelect
          options={TIER_OPTIONS}
          selected={filters.companyTiers}
          onToggle={(v) => toggle("companyTiers", v)}
        />
      </FilterSection>

      <FilterSection title="Language" defaultOpen={false}>
        <MultiSelect
          options={LANGUAGE_OPTIONS}
          selected={filters.languages}
          onToggle={(v) => toggle("languages", v)}
        />
      </FilterSection>

      <FilterSection title="Location" defaultOpen={false}>
        <MultiSelect
          options={LOCATION_OPTIONS}
          selected={filters.locations}
          onToggle={(v) => toggle("locations", v)}
        />
        <label className="flex items-center gap-2.5 mt-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.remoteAvailable}
            onChange={(e) => onFiltersChange({ ...filters, remoteAvailable: e.target.checked })}
            className="rounded border-border accent-blue-600 w-3.5 h-3.5"
          />
          <span className={cn("text-sm", filters.remoteAvailable ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
            Remote Available
          </span>
        </label>
      </FilterSection>

      <FilterSection title="Verification" defaultOpen={true}>
        <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFiltersChange({ ...filters, verified: e.target.checked })}
            className="rounded border-border accent-blue-600 w-3.5 h-3.5"
          />
          <span className={cn("text-sm", filters.verified ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
            Verified Mentors Only
          </span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-80 bg-background shadow-2xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Filters</span>
              <button onClick={onMobileClose}><X className="w-5 h-5" /></button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
