"use client";

import { X } from "lucide-react";
import { FilterState } from "./FilterSidebar";

const EXP_KEYS = ["0-2", "2-5", "5-8", "8-12", "12+"];
const EXP_LABELS: Record<string, string> = {
  "0-2": "0-2 Years", "2-5": "2-5 Years", "5-8": "5-8 Years",
  "8-12": "8-12 Years", "12+": "12+ Years",
};

interface ActiveFiltersProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}

interface Chip {
  label: string;
  remove: () => void;
}

export function ActiveFilters({ filters, onFiltersChange }: ActiveFiltersProps) {
  const chips: Chip[] = [];

  filters.experience.forEach((e) =>
    chips.push({ label: EXP_LABELS[e] ?? e, remove: () => onFiltersChange({ ...filters, experience: filters.experience.filter((x) => x !== e) }) })
  );
  filters.companies.forEach((c) =>
    chips.push({ label: c, remove: () => onFiltersChange({ ...filters, companies: filters.companies.filter((x) => x !== c) }) })
  );
  filters.roles.forEach((r) =>
    chips.push({ label: r, remove: () => onFiltersChange({ ...filters, roles: filters.roles.filter((x) => x !== r) }) })
  );
  filters.skills.forEach((s) =>
    chips.push({ label: s, remove: () => onFiltersChange({ ...filters, skills: filters.skills.filter((x) => x !== s) }) })
  );
  filters.industries.forEach((i) =>
    chips.push({ label: i, remove: () => onFiltersChange({ ...filters, industries: filters.industries.filter((x) => x !== i) }) })
  );
  filters.goals.forEach((g) =>
    chips.push({ label: g, remove: () => onFiltersChange({ ...filters, goals: filters.goals.filter((x) => x !== g) }) })
  );
  filters.companyTiers.forEach((t) =>
    chips.push({ label: t, remove: () => onFiltersChange({ ...filters, companyTiers: filters.companyTiers.filter((x) => x !== t) }) })
  );
  filters.languages.forEach((l) =>
    chips.push({ label: l, remove: () => onFiltersChange({ ...filters, languages: filters.languages.filter((x) => x !== l) }) })
  );
  filters.locations.forEach((loc) =>
    chips.push({ label: loc, remove: () => onFiltersChange({ ...filters, locations: filters.locations.filter((x) => x !== loc) }) })
  );
  if (filters.minRating)
    chips.push({ label: `${filters.minRating}+ ⭐`, remove: () => onFiltersChange({ ...filters, minRating: "" }) });
  if (filters.verified)
    chips.push({ label: "Verified Only", remove: () => onFiltersChange({ ...filters, verified: false }) });
  if (filters.remoteAvailable)
    chips.push({ label: "Remote", remove: () => onFiltersChange({ ...filters, remoteAvailable: false }) });
  if (filters.priceRange[0] !== 500 || filters.priceRange[1] !== 5000)
    chips.push({
      label: `₹${filters.priceRange[0].toLocaleString()}–₹${filters.priceRange[1].toLocaleString()}`,
      remove: () => onFiltersChange({ ...filters, priceRange: [500, 5000] }),
    });

  if (chips.length === 0) return null;

  const clearAll = () =>
    onFiltersChange({
      experience: [], companies: [], roles: [], skills: [], industries: [],
      goals: [], priceRange: [500, 5000], minRating: "",
      companyTiers: [], languages: [], locations: [],
      remoteAvailable: false, verified: false,
    });

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-border/40">
      <span className="text-xs text-muted-foreground font-medium mr-1 shrink-0">Active:</span>
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-full px-3 py-1 text-xs font-medium transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors underline ml-1"
        >
          Clear all ({chips.length})
        </button>
      )}
    </div>
  );
}
