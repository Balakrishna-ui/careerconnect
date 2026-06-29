"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar, Search,
  Users, CheckCircle2, XCircle, AlertCircle, Filter,
  CalendarOff, CalendarCheck, MoreVertical, RefreshCw,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MENTORS = [
  {
    id: "m1",
    name: "Anika Sharma",
    role: "Senior SWE",
    company: "Google",
    image: null,
    totalSessions: 142,
    upcomingSessions: 4,
    blockedDates: 2,
    status: "active",
    schedule: [
      { day: "Mon", slots: ["09:00–10:00", "14:00–15:00"] },
      { day: "Tue", slots: ["10:00–11:00"] },
      { day: "Wed", slots: ["09:00–10:00", "11:00–12:00", "15:00–16:00"] },
      { day: "Thu", slots: [] },
      { day: "Fri", slots: ["09:00–10:00"] },
      { day: "Sat", slots: [] },
      { day: "Sun", slots: [] },
    ],
  },
  {
    id: "m2",
    name: "Rohan Mehta",
    role: "Product Manager",
    company: "Microsoft",
    image: null,
    totalSessions: 89,
    upcomingSessions: 2,
    blockedDates: 0,
    status: "active",
    schedule: [
      { day: "Mon", slots: [] },
      { day: "Tue", slots: ["13:00–14:00", "16:00–17:00"] },
      { day: "Wed", slots: ["10:00–11:00"] },
      { day: "Thu", slots: ["09:00–10:00", "11:00–12:00"] },
      { day: "Fri", slots: ["14:00–15:00"] },
      { day: "Sat", slots: ["10:00–11:00"] },
      { day: "Sun", slots: [] },
    ],
  },
  {
    id: "m3",
    name: "Priya Nair",
    role: "Data Scientist",
    company: "Amazon",
    image: null,
    totalSessions: 211,
    upcomingSessions: 7,
    blockedDates: 3,
    status: "busy",
    schedule: [
      { day: "Mon", slots: ["08:00–09:00"] },
      { day: "Tue", slots: [] },
      { day: "Wed", slots: ["08:00–09:00", "17:00–18:00"] },
      { day: "Thu", slots: [] },
      { day: "Fri", slots: ["08:00–09:00"] },
      { day: "Sat", slots: [] },
      { day: "Sun", slots: [] },
    ],
  },
  {
    id: "m4",
    name: "Vikram Joshi",
    role: "UX Designer",
    company: "Flipkart",
    image: null,
    totalSessions: 54,
    upcomingSessions: 0,
    blockedDates: 5,
    status: "unavailable",
    schedule: [
      { day: "Mon", slots: [] },
      { day: "Tue", slots: [] },
      { day: "Wed", slots: [] },
      { day: "Thu", slots: [] },
      { day: "Fri", slots: [] },
      { day: "Sat", slots: [] },
      { day: "Sun", slots: [] },
    ],
  },
  {
    id: "m5",
    name: "Deepa Rao",
    role: "DevOps Engineer",
    company: "Infosys",
    image: null,
    totalSessions: 178,
    upcomingSessions: 3,
    blockedDates: 1,
    status: "active",
    schedule: [
      { day: "Mon", slots: ["11:00–12:00"] },
      { day: "Tue", slots: ["11:00–12:00"] },
      { day: "Wed", slots: [] },
      { day: "Thu", slots: ["11:00–12:00", "15:00–16:00"] },
      { day: "Fri", slots: ["11:00–12:00"] },
      { day: "Sat", slots: [] },
      { day: "Sun", slots: [] },
    ],
  },
];

const BLOCKED_DATES_LOG = [
  { mentor: "Anika Sharma", date: "2026-07-04", reason: "National Holiday" },
  { mentor: "Anika Sharma", date: "2026-07-10", reason: "Personal leave" },
  { mentor: "Priya Nair", date: "2026-07-01", reason: "Conference" },
  { mentor: "Priya Nair", date: "2026-07-15", reason: "Medical" },
  { mentor: "Priya Nair", date: "2026-07-20", reason: "Vacation" },
  { mentor: "Vikram Joshi", date: "2026-07-01", reason: "Sick leave" },
  { mentor: "Vikram Joshi", date: "2026-07-05", reason: "Training" },
  { mentor: "Vikram Joshi", date: "2026-07-12", reason: "Workshop" },
  { mentor: "Vikram Joshi", date: "2026-07-18", reason: "Personal" },
  { mentor: "Vikram Joshi", date: "2026-07-22", reason: "Holiday" },
  { mentor: "Deepa Rao", date: "2026-07-08", reason: "Team offsite" },
];

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  active:      { label: "Active",      color: "text-green-700 bg-green-50 border-green-200",   dot: "bg-green-500" },
  busy:        { label: "Busy",        color: "text-amber-700 bg-amber-50 border-amber-200",   dot: "bg-amber-500" },
  unavailable: { label: "Unavailable", color: "text-red-700 bg-red-50 border-red-200",         dot: "bg-red-500" },
};

const totalSlots = (mentor: typeof MENTORS[0]) =>
  mentor.schedule.reduce((acc, d) => acc + d.slots.length, 0);

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(MENTORS[0]);
  const [activeTab, setActiveTab] = useState<"schedule" | "blocked">("schedule");

  const filtered = MENTORS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  const blockedForSelected = BLOCKED_DATES_LOG.filter(
    (b) => b.mentor === selected.name
  );

  const kpis = [
    {
      label: "Active Mentors",
      value: MENTORS.filter((m) => m.status === "active").length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Busy / Limited",
      value: MENTORS.filter((m) => m.status === "busy").length,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Unavailable",
      value: MENTORS.filter((m) => m.status === "unavailable").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Total Blocked Dates",
      value: BLOCKED_DATES_LOG.length,
      icon: CalendarOff,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability Management</h1>
          <p className="text-sm text-muted-foreground">
            Monitor mentor weekly schedules, blocked dates, and booking capacity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content — split panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Mentor List */}
        <div className="xl:col-span-4 space-y-3">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/40"
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No mentors found.</p>
              )}
              {filtered.map((m) => {
                const st = STATUS_MAP[m.status];
                const isSelected = selected.id === m.id;
                const slots = totalSlots(m);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-blue-200 bg-blue-50/60 dark:bg-blue-900/20 dark:border-blue-700"
                        : "border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff&size=40`}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dot}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.role} · {m.company}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">{slots} slot{slots !== 1 ? "s" : ""}/wk</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Detail View */}
        <div className="xl:col-span-8 space-y-4">
          {/* Mentor header */}
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selected.name)}&background=6366f1&color=fff&size=56`}
                    alt={selected.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-bold">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.role} · {selected.company}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" /> {selected.upcomingSessions} upcoming
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarOff className="w-3.5 h-3.5" /> {selected.blockedDates} blocked
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {selected.totalSessions} total sessions
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Force Block Date</DropdownMenuItem>
                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Mark Unavailable</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            {(["schedule", "blocked"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "schedule" ? "Weekly Schedule" : "Blocked Dates"}
              </button>
            ))}
          </div>

          {activeTab === "schedule" && (
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Weekly Availability Grid
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const dayData = selected.schedule.find((s) => s.day === day);
                    const slots = dayData?.slots ?? [];
                    const hasSlots = slots.length > 0;
                    return (
                      <div
                        key={day}
                        className={`rounded-xl border p-3 flex flex-col items-center gap-2 min-h-[120px] transition-colors ${
                          hasSlots
                            ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10"
                            : "border-dashed border-gray-200 bg-gray-50/50 dark:bg-gray-900/20"
                        }`}
                      >
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${hasSlots ? "text-blue-600" : "text-gray-400"}`}>
                          {day}
                        </span>
                        {hasSlots ? (
                          <div className="w-full space-y-1">
                            {slots.map((slot, i) => (
                              <div
                                key={i}
                                className="text-[10px] text-blue-700 bg-blue-100 dark:bg-blue-800/40 dark:text-blue-300 rounded-lg px-1.5 py-1 text-center font-medium leading-tight"
                              >
                                {slot}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center flex-1 gap-1">
                            <XCircle className="w-5 h-5 text-gray-300" />
                            <span className="text-[10px] text-gray-400">Off</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" />
                    Available day
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-50 border border-dashed border-gray-200 inline-block" />
                    Off day
                  </span>
                  <span className="ml-auto font-medium text-foreground">
                    {totalSlots(selected)} slot{totalSlots(selected) !== 1 ? "s" : ""} this week
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "blocked" && (
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-red-500" /> Blocked Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {blockedForSelected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                    <CalendarCheck className="w-12 h-12 text-green-300" />
                    <p className="font-semibold text-green-600">No blocked dates</p>
                    <p className="text-xs">This mentor has no blocked dates this month.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedForSelected.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-900/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <CalendarOff className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {new Date(b.date).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.reason}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-100 text-xs">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
