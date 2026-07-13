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

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  admin: { name: string; email: string };
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
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isMoreInfoModalOpen, setIsMoreInfoModalOpen] = useState(false);
  const [moreInfoMessage, setMoreInfoMessage] = useState("");
  const [moreInfoDocs, setMoreInfoDocs] = useState("");
  const [moreInfoDeadline, setMoreInfoDeadline] = useState("");

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

  async function handleAction(action: "APPROVE" | "REJECT" | "REQUEST_MORE_INFO" | "REOPEN", payloadReason?: string) {
    if (!selectedId) return;

    const finalReason = payloadReason ?? reviewNote;

    if (action === "REJECT" && finalReason.trim().length < 20) {
      alert("Reject reason must be at least 20 characters long.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedId,
          action,
          reason: finalReason,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to perform action");
      } else {
        setReviewNote("");
        setIsMoreInfoModalOpen(false);
        setMoreInfoMessage("");
        setMoreInfoDocs("");
        setMoreInfoDeadline("");
        await fetchApplications();
      }
    } catch (err) {
      console.error("Action failed:", err);
      alert("Something went wrong");
    }
    setActionLoading(false);
  }

  async function fetchActivityLogs() {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/admin/reviews/logs?mentorId=${selectedId}`);
      const data = await res.json();
      setActivityLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  }

  async function handleDeleteApplication() {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?mentorId=${selectedId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedId(null);
        await fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
    setActionLoading(false);
  }

  const selected = mentors.find(m => m.id === selectedId);
  const isRejected = selected?.applicationStatus === "REJECTED";
  const rejectionReview = isRejected ? selected?.adminReviews?.find(r => r.statusGiven === "REJECTED") : null;

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
              
              {/* REJECTED BANNER */}
              {isRejected && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900">Mentor Application Rejected</h4>
                      <p className="text-sm text-red-700 mt-1">This application has been rejected by the administrator.</p>
                      {rejectionReview && (
                        <p className="text-xs text-red-600 font-medium mt-2">
                          Rejected on: {new Date(rejectionReview.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
              {isRejected && rejectionReview && (
                <div className="mb-6 p-5 bg-red-50 rounded-xl border-l-4 border-red-500 animate-in fade-in duration-300">
                  <h4 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-4 border-b border-red-100 pb-2">Rejection Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-700 font-medium">Rejected By</span>
                      <span className="text-red-900 font-semibold">{rejectionReview.admin?.name || "Admin"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700 font-medium">Rejected On</span>
                      <span className="text-red-900 font-semibold">{new Date(rejectionReview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-red-700 font-medium block mb-1">Reason</span>
                      <span className="text-red-900 font-semibold bg-red-100 px-2 py-1 rounded-md">{rejectionReview.reason?.split(":")[0] || "Requirements Not Met"}</span>
                    </div>
                    {rejectionReview.reason && rejectionReview.reason.includes(":") && (
                      <div className="pt-2">
                        <span className="text-red-700 font-medium block mb-1">Notes</span>
                        <p className="text-red-800 bg-red-100/50 p-3 rounded-lg">{rejectionReview.reason.split(":").slice(1).join(":")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-t border-gray-100 pt-6">Document Checklist</h4>
                {selected.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selected.documents.map(doc => {
                      const badge = isRejected 
                        ? { color: "text-green-700 bg-green-50", icon: CheckCircle2, label: "Reviewed" }
                        : (DOC_STATUS_BADGE[doc.status] || DOC_STATUS_BADGE["PENDING"]);
                      const Icon = badge.icon;
                      return (
                        <div 
                          key={doc.id} 
                          onClick={() => !isRejected && setViewingDoc(doc.fileUrl)}
                          className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 transition-colors ${isRejected ? "opacity-90" : "hover:bg-white cursor-pointer group"}`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className={`w-4 h-4 text-gray-400 ${!isRejected && "group-hover:text-blue-500 transition-colors"}`} />
                            <span className={`font-medium text-sm text-gray-700 ${!isRejected && "group-hover:text-blue-700 transition-colors"}`}>{doc.type.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${badge.color}`}>
                              <Icon className="w-3 h-3" /> {badge.label}
                            </span>
                            {!isRejected && <Eye className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />}
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
              <h3 className="text-lg font-bold text-gray-900 mb-6">{isRejected ? "Application Status" : "Review Actions"}</h3>

              {isRejected ? (
                <div className="flex-1 space-y-6 animate-in fade-in duration-300">
                  {/* Status Card */}
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-bold text-red-900">Application Rejected</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-3">This mentor application is currently rejected.</p>
                    <div className="space-y-2 pt-3 border-t border-red-100">
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <CheckCircle2 className="w-4 h-4 text-red-500" /> Rejection Email Sent
                      </div>
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <CheckCircle2 className="w-4 h-4 text-red-500" /> Applicant Notified
                      </div>
                    </div>
                  </div>

                  {/* Profile completion */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Profile Status</p>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Application Closed</span>
                      <div className="w-16 h-1.5 bg-red-500 rounded-full" />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pt-2 pb-2">Timeline</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
                      
                      <div className="relative flex items-center justify-between group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-500 shadow shrink-0 z-10">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] text-sm text-gray-500 font-medium ml-4">
                          Submitted
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-500 shadow shrink-0 z-10">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] text-sm text-gray-500 font-medium ml-4">
                          Documents Uploaded
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-500 shadow shrink-0 z-10">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] text-sm text-gray-500 font-medium ml-4">
                          Under Review
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-red-500 bg-red-100 text-red-500 shadow shrink-0 z-10">
                          <XCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <div className="w-[calc(100%-2.5rem)] text-sm text-red-600 font-bold ml-4">
                          Rejected
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <h4 className="font-bold text-red-800 text-sm mb-1">ℹ️ Information</h4>
                    <p className="text-xs text-red-700 mb-2">This application has been rejected. The mentor profile is not visible on the platform.</p>
                    <p className="text-xs text-red-700">The applicant may submit a new application or the admin can reopen this review.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-6 animate-in fade-in duration-300">
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
              )}

              <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                {isRejected ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("REOPEN")}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reopen Application"}
                    </button>
                    <button
                      onClick={() => {
                        fetchActivityLogs();
                        setIsActivityLogOpen(true);
                      }}
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      View Activity Log
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full bg-white hover:bg-red-50 border border-transparent hover:border-red-200 text-red-500 font-semibold py-3 px-4 rounded-xl transition-all"
                    >
                      Delete Application
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
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
                      onClick={() => setIsMoreInfoModalOpen(true)}
                      className="w-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      Request More Information
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("REJECT")}
                      className="w-full bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 text-red-600 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reject Application"}
                    </button>
                  </div>
                )}
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

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Document Viewer</h3>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
              {(() => {
                const isUrl = viewingDoc.startsWith('http') || viewingDoc.startsWith('/uploads/');
                const isDataUri = viewingDoc.startsWith('data:');
                // Basic check for raw base64 strings (long, no spaces)
                const isRawBase64 = viewingDoc.length > 100 && !viewingDoc.includes(' ');
                
                let src = null;
                if (isUrl || isDataUri) {
                  src = viewingDoc;
                } else if (isRawBase64) {
                  const mimeType = viewingDoc.startsWith('JVBER') ? 'application/pdf' : 'image/jpeg';
                  src = `data:${mimeType};base64,${viewingDoc}`;
                }

                if (src) {
                  return (
                    <iframe 
                      src={src} 
                      className="w-full h-[70vh] rounded-xl shadow-sm border border-gray-200"
                      title="Document Viewer"
                    />
                  );
                }

                return (
                  <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-center space-y-4">
                      <FileText className="w-24 h-24 text-gray-300 mx-auto" />
                      <p className="text-gray-600 font-medium bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm max-h-32 overflow-hidden text-ellipsis break-all">
                        {viewingDoc}
                      </p>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">
                        (No preview available. This application was submitted before file uploads were enabled or format is unsupported.)
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {isActivityLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Activity Log</h3>
              <button onClick={() => setIsActivityLogOpen(false)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
              {activityLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity logs found.</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-800">{log.action.replace(/_/g, ' ')}</span>
                        <p className="text-xs text-gray-500">By {log.admin?.name || "System"}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <pre className="bg-gray-50 p-2 rounded text-xs text-gray-600 mt-2 whitespace-pre-wrap font-sans">
                      {log.details}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {isMoreInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Request More Information</h3>
              <button onClick={() => setIsMoreInfoModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Message to applicant</label>
                <textarea
                  value={moreInfoMessage}
                  onChange={e => setMoreInfoMessage(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  rows={3}
                  placeholder="Explain what needs to be fixed..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Documents Needed (Optional)</label>
                <input
                  type="text"
                  value={moreInfoDocs}
                  onChange={e => setMoreInfoDocs(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="e.g. Updated Resume, Offer Letter"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={moreInfoDeadline}
                  onChange={e => setMoreInfoDeadline(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <button
                disabled={actionLoading || !moreInfoMessage}
                onClick={() => handleAction("REQUEST_MORE_INFO", JSON.stringify({ message: moreInfoMessage, documents: moreInfoDocs, deadline: moreInfoDeadline }))}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl mt-2"
              >
                {actionLoading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-red-100 bg-red-50">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-red-900">Delete Application</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to permanently delete this mentor application? This will reset the user's role and delete all application data. They can reapply later. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleDeleteApplication}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl"
                >
                  {actionLoading ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
