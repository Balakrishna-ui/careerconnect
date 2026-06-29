"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, Search, Eye, Filter, User, Briefcase, 
  FileText, ChevronRight, Clock, AlertCircle, Shield, Mail, Phone,
  Link2, ExternalLink, Loader2
} from "lucide-react";

interface MentorApplication {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  industry: string | null;
  experienceYears: number | null;
  image: string | null;
  applicationStatus: string;
  completionScore: number;
  bio: string | null;
  createdAt: string;
  skills: { id: string; name: string; category: string }[];
  sessionTypes: { id: string; title: string; duration: number; price: number }[];
  socialProfiles: { linkedin: string; portfolio?: string; github?: string } | null;
  documents: { id: string; type: string; status: string; fileUrl: string }[];
  adminReviews: { id: string; statusGiven: string; reason?: string; createdAt: string; admin: { name: string } }[];
  user: { email: string; mobile: string | null };
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending Review" },
  VERIFIED: { bg: "bg-green-50", text: "text-green-700", label: "Verified" },
  REJECTED: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
  MORE_INFO_REQUIRED: { bg: "bg-blue-50", text: "text-blue-700", label: "More Info Needed" },
  DRAFT: { bg: "bg-gray-50", text: "text-gray-500", label: "Draft" },
};

const DOC_STATUS_BADGE: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  PENDING: { color: "text-amber-600 bg-amber-50", icon: Clock, label: "Pending Review" },
  VERIFIED: { color: "text-green-600 bg-green-50", icon: CheckCircle2, label: "Verified" },
  REJECTED: { color: "text-red-600 bg-red-50", icon: XCircle, label: "Rejected" },
};

export default function VerificationDashboard() {
  const [mentors, setMentors] = useState<MentorApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`);
      const data = await res.json();
      setMentors(data.mentors || []);
      if (data.mentors?.length > 0) {
        setSelectedId(data.mentors[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  }

  async function handleAction(action: "APPROVE" | "REJECT" | "REQUEST_MORE_INFO") {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      // Using a placeholder admin ID for now
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedId,
          adminId: "admin-placeholder",
          action,
          reason: reviewNote,
        }),
      });
      setReviewNote("");
      await fetchApplications();
    } catch (err) {
      console.error("Action failed:", err);
    }
    setActionLoading(false);
  }

  const selected = mentors.find(m => m.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mentor Verification</h1>
          </div>
          <div className="flex items-center gap-3">
            {["PENDING", "MORE_INFO_REQUIRED", "VERIFIED", "REJECTED"].map(s => {
              const badge = STATUS_BADGE[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    statusFilter === s 
                      ? `${badge.bg} ${badge.text} border-current` 
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {badge.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Panel — Queue */}
          <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-sm">{STATUS_BADGE[statusFilter]?.label} Queue</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{mentors.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : mentors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-500">All clear!</p>
                  <p className="text-sm">No applications in this queue.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {mentors.map(m => {
                    const badge = STATUS_BADGE[m.applicationStatus] || STATUS_BADGE["PENDING"];
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={`w-full text-left p-4 rounded-xl transition-colors border ${
                          selectedId === m.id ? "border-blue-200 bg-blue-50/50" : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={m.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff&size=40`}
                            alt={m.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{m.name}</p>
                            <p className="text-xs text-gray-500 truncate">{m.role} @ {m.company}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel — Profile & Documents */}
          {selected && (
            <div className="xl:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto p-6" style={{ height: 'calc(100vh - 130px)' }}>
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-8">
                <img
                  src={selected.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.name)}&background=6366f1&color=fff&size=64`}
                  alt={selected.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-gray-600">{selected.role} at <span className="font-semibold text-gray-800">{selected.company}</span></p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {selected.experienceYears && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {selected.experienceYears} yrs exp.</span>}
                    {selected.industry && <span>• {selected.industry}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href={`mailto:${selected.user.email}`} className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100">
                      <Mail className="w-3 h-3" /> {selected.user.email}
                    </a>
                    {selected.user.mobile && (
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <Phone className="w-3 h-3" /> {selected.user.mobile}
                      </span>
                    )}
                    {selected.socialProfiles?.linkedin && (
                      <a href={selected.socialProfiles.linkedin} target="_blank" className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100">
                        <Link2 className="w-3 h-3" /> LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Professional Bio</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selected.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selected.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map(s => (
                      <span key={s.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Types */}
              {selected.sessionTypes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Session Types</h4>
                  <div className="space-y-2">
                    {selected.sessionTypes.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium text-gray-700">{s.title}</span>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{s.duration} mins</span>
                          <span className="font-bold text-gray-900">₹{s.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Checklist */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-t border-gray-100 pt-6">Document Checklist</h4>
                {selected.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selected.documents.map(doc => {
                      const badge = DOC_STATUS_BADGE[doc.status] || DOC_STATUS_BADGE["PENDING"];
                      const Icon = badge.icon;
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-sm text-gray-700">{doc.type.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${badge.color}`}>
                              <Icon className="w-3 h-3" /> {badge.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700">No documents uploaded yet.</p>
                  </div>
                )}
              </div>

              {/* Audit Trail */}
              {selected.adminReviews.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Audit Trail</h4>
                  <div className="space-y-3">
                    {selected.adminReviews.map(r => (
                      <div key={r.id} className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-gray-700">
                            <span className="font-semibold">{r.admin.name}</span> set status to <span className="font-semibold">{r.statusGiven}</span>
                          </p>
                          {r.reason && <p className="text-gray-500 mt-0.5">Reason: {r.reason}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Panel — Actions */}
          {selected && (
            <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Review Actions</h3>

              <div className="flex-1 space-y-6">
                {/* Profile completion */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Profile Completion</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selected.completionScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-blue-600">{selected.completionScore}%</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Admin Notes</label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add a note about this verification..."
                    className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-sm"
                  />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <h4 className="font-bold text-amber-800 text-sm mb-1">⚠️ Attention</h4>
                  <p className="text-xs text-amber-700">Approving this mentor will immediately publish their profile on the public directory.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("APPROVE")}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Approve Mentor
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("REQUEST_MORE_INFO")}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all"
                >
                  Request More Information
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("REJECT")}
                  className="w-full bg-white hover:bg-red-50 hover:text-red-600 disabled:opacity-50 text-gray-500 font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Empty state when no selection */}
          {!selected && !loading && (
            <div className="xl:col-span-9 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center" style={{ height: 'calc(100vh - 130px)' }}>
              <div className="text-center text-gray-400">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="font-semibold text-gray-500 text-lg">No Application Selected</p>
                <p className="text-sm">Select an application from the queue to review.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
