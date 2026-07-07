"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { getMentors, getFilterCounts, MentorFilters } from "@/actions/mentor-actions";
import { FilterSidebar, FilterState } from "@/components/mentors/FilterSidebar";
import { MentorResultCard } from "@/components/mentors/MentorResultCard";
import { ActiveFilters } from "@/components/mentors/ActiveFilters";
import { Search, SlidersHorizontal, Grid, List, ChevronLeft, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const DEFAULT_FILTERS: FilterState = {
  experience: [], companies: [], roles: [], skills: [], industries: [],
  goals: [], priceRange: [0, 5000], minRating: "",
  companyTiers: [], languages: [], locations: [],
  remoteAvailable: false, verified: false,
};

const TRENDING = ["Product Manager", "Data Scientist", "AWS", "System Design", "FAANG", "Career Switch"];
const RECENT = ["Google SWE", "SAP Consultant", "Resume Review"];

export default function MentorsContent() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [results, setResults] = useState<{
    mentors: ReturnType<typeof Array.prototype.slice>;
    total: number;
  }>({ mentors: [], total: 0 });
  const [counts, setCounts] = useState<{
    companies: { name: string; count: number }[];
    industries: { name: string; count: number }[];
    tiers: { name: string; count: number }[];
    locations: { name: string; count: number }[];
    totalVerified: number;
  } | null>(null);

  const LIMIT = 12;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch, sortBy]);

  // Fetch mentors whenever filters or page changes
  useEffect(() => {
    startTransition(async () => {
      const apiFilters: MentorFilters = {
        search: debouncedSearch || undefined,
        experience: filters.experience,
        companies: filters.companies,
        roles: filters.roles,
        skills: filters.skills,
        industries: filters.industries,
        goals: filters.goals,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
        companyTiers: filters.companyTiers,
        verified: filters.verified || undefined,
        languages: filters.languages,
        locations: filters.locations,
        remoteAvailable: filters.remoteAvailable || undefined,
        sortBy,
        page,
        limit: LIMIT,
      };
      const data = await getMentors(apiFilters);
      setResults({ mentors: data.mentors as never[], total: data.total });
    });
  }, [filters, debouncedSearch, sortBy, page]);

  // Load sidebar counts once
  useEffect(() => {
    getFilterCounts().then(setCounts);
  }, []);

  const totalPages = Math.ceil(results.total / LIMIT);

  return (
    <div className="min-h-screen">
      {/* ── Hero Search Bar ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/40 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Find Your Mentor</h1>
            <p className="text-muted-foreground">
              Discover verified professionals from top companies for 1-on-1 guidance
            </p>
          </div>

          {/* Search box */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="mentor-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by name, role, company, skill (e.g. AWS, Product Manager, Google)..."
              className="pl-12 pr-4 h-14 text-base rounded-2xl bg-background border-border/60 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
            />

            {/* Suggestion dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                {search.length === 0 && (
                  <>
                    <div className="p-3 border-b border-border/40">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Trending Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING.map((t) => (
                          <button
                            key={t}
                            onMouseDown={() => { setSearch(t); setShowSuggestions(false); }}
                            className="text-xs bg-muted/60 hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1.5 transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-xs text-muted-foreground font-medium mb-2">🕐 Recent Searches</div>
                      {RECENT.map((r) => (
                        <button
                          key={r}
                          onMouseDown={() => { setSearch(r); setShowSuggestions(false); }}
                          className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted/60 rounded-lg px-2 py-1.5 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Search className="w-3.5 h-3.5" /> {r}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            counts={counts ?? undefined}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          {/* Main results area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: Active chips + Sort + View toggle */}
            <div className="space-y-3 mb-5">
              <ActiveFilters filters={filters} onFiltersChange={setFilters} />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden flex items-center gap-2 rounded-lg"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                  {isPending ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{results.total.toLocaleString()}</span> mentors found
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as string)}>
                    <SelectTrigger className="w-44 h-9 rounded-lg text-sm" id="sort-mentors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Most Relevant</SelectItem>
                      <SelectItem value="highest-rated">Highest Rated</SelectItem>
                      <SelectItem value="most-booked">Most Booked</SelectItem>
                      <SelectItem value="price-low">Lowest Price</SelectItem>
                      <SelectItem value="price-high">Highest Price</SelectItem>
                      <SelectItem value="most-experienced">Most Experienced</SelectItem>
                      <SelectItem value="recently-joined">Recently Joined</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View toggle */}
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setView("grid")}
                      className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {results.mentors.length === 0 && !isPending ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No mentors found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search query to discover the perfect mentor.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setFilters(DEFAULT_FILTERS); setSearch(""); }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                      : "flex flex-col gap-4"
                  }
                >
                  {(results.mentors as any[]).map((mentor) => (
                    <MentorResultCard key={mentor.id} mentor={mentor} view={view} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              p === page
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
