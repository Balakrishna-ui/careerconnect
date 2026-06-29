// ============================================================
// ADMIN PANEL — CENTRAL MOCK DATA
// Swap each array with a real API call to go production-ready
// ============================================================

export type UserStatus = "active" | "suspended" | "banned" | "pending";
export type VerificationStatus = "pending" | "under_review" | "verified" | "rejected";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "success" | "pending" | "failed" | "refunded";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type FraudRisk = "low" | "medium" | "high";
export type ReviewStatus = "visible" | "hidden" | "flagged";

// ── KPI Summary ──────────────────────────────────────────────
export const ADMIN_KPI = {
  totalUsers: 12_847,
  totalMentors: 1_234,
  totalJobSeekers: 11_613,
  verifiedMentors: 987,
  pendingVerifications: 47,
  todaySessions: 128,
  totalRevenue: 8_42_500,
  monthlyRevenue: 1_24_300,
  userGrowth: 12.4,
  revenueGrowth: 18.7,
  sessionGrowth: 9.2,
};

// ── Revenue Chart Data ────────────────────────────────────────
export const REVENUE_TREND = [
  { month: "Jan", revenue: 42000, commission: 6300, payouts: 35700 },
  { month: "Feb", revenue: 58000, commission: 8700, payouts: 49300 },
  { month: "Mar", revenue: 71000, commission: 10650, payouts: 60350 },
  { month: "Apr", revenue: 63000, commission: 9450, payouts: 53550 },
  { month: "May", revenue: 89000, commission: 13350, payouts: 75650 },
  { month: "Jun", revenue: 94000, commission: 14100, payouts: 79900 },
  { month: "Jul", revenue: 107000, commission: 16050, payouts: 90950 },
  { month: "Aug", revenue: 98000, commission: 14700, payouts: 83300 },
  { month: "Sep", revenue: 124300, commission: 18645, payouts: 105655 },
];

export const USER_GROWTH_TREND = [
  { month: "Jan", mentors: 780, jobSeekers: 4200 },
  { month: "Feb", mentors: 850, jobSeekers: 5100 },
  { month: "Mar", mentors: 920, jobSeekers: 6400 },
  { month: "Apr", mentors: 980, jobSeekers: 7800 },
  { month: "May", mentors: 1050, jobSeekers: 9100 },
  { month: "Jun", mentors: 1120, jobSeekers: 10200 },
  { month: "Jul", mentors: 1180, jobSeekers: 10900 },
  { month: "Aug", mentors: 1210, jobSeekers: 11300 },
  { month: "Sep", mentors: 1234, jobSeekers: 11613 },
];

export const SESSION_TREND = [
  { month: "Jan", sessions: 320 },
  { month: "Feb", sessions: 480 },
  { month: "Mar", sessions: 620 },
  { month: "Apr", sessions: 580 },
  { month: "May", sessions: 790 },
  { month: "Jun", sessions: 910 },
  { month: "Jul", sessions: 1040 },
  { month: "Aug", sessions: 980 },
  { month: "Sep", sessions: 1128 },
];

export const VERIFICATION_STATUS_PIE = [
  { name: "Verified", value: 987, color: "#10b981" },
  { name: "Pending", value: 47, color: "#f59e0b" },
  { name: "Under Review", value: 83, color: "#3b82f6" },
  { name: "Rejected", value: 117, color: "#ef4444" },
];

// ── Mentors ───────────────────────────────────────────────────
export interface AdminMentor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  company: string;
  designation: string;
  category: string;
  verificationStatus: VerificationStatus;
  accountStatus: UserStatus;
  rating: number;
  sessionsCompleted: number;
  earnings: number;
  joinedAt: string;
  image: string;
  location: string;
}

export const ADMIN_MENTORS: AdminMentor[] = [
  { id: "M001", name: "Sarah Chen", email: "sarah.chen@google.com", mobile: "+1-415-555-0101", company: "Google", designation: "Senior Software Engineer", category: "Software Engineering", verificationStatus: "verified", accountStatus: "active", rating: 4.9, sessionsCompleted: 124, earnings: 18600, joinedAt: "2023-01-15", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop", location: "San Francisco, CA" },
  { id: "M002", name: "Marcus Johnson", email: "m.johnson@stripe.com", mobile: "+1-212-555-0102", company: "Stripe", designation: "Product Manager", category: "Product Management", verificationStatus: "verified", accountStatus: "active", rating: 4.8, sessionsCompleted: 89, earnings: 10680, joinedAt: "2023-02-20", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&auto=format&fit=crop", location: "New York, NY" },
  { id: "M003", name: "Elena Rodriguez", email: "elena.r@airbnb.com", mobile: "+1-323-555-0103", company: "Airbnb", designation: "UX Design Lead", category: "Design", verificationStatus: "verified", accountStatus: "active", rating: 5.0, sessionsCompleted: 210, earnings: 37800, joinedAt: "2022-11-08", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&auto=format&fit=crop", location: "Remote" },
  { id: "M004", name: "David Kim", email: "david.kim@netflix.com", mobile: "+1-408-555-0104", company: "Netflix", designation: "Engineering Manager", category: "Software Engineering", verificationStatus: "verified", accountStatus: "active", rating: 4.9, sessionsCompleted: 156, earnings: 31200, joinedAt: "2023-03-01", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&auto=format&fit=crop", location: "Los Gatos, CA" },
  { id: "M005", name: "Anita Patel", email: "anita.p@meta.com", mobile: "+1-650-555-0105", company: "Meta", designation: "Data Scientist", category: "Data Science", verificationStatus: "pending", accountStatus: "pending", rating: 0, sessionsCompleted: 0, earnings: 0, joinedAt: "2024-09-10", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&auto=format&fit=crop", location: "Menlo Park, CA" },
  { id: "M006", name: "James Wilson", email: "jwilson@vercel.com", mobile: "+1-416-555-0106", company: "Vercel", designation: "Frontend Architect", category: "Software Engineering", verificationStatus: "under_review", accountStatus: "pending", rating: 0, sessionsCompleted: 0, earnings: 0, joinedAt: "2024-09-12", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&auto=format&fit=crop", location: "Remote" },
  { id: "M007", name: "Priya Sharma", email: "priya.s@tcs.com", mobile: "+91-98765-43210", company: "TCS", designation: "SAP Consultant", category: "Consulting", verificationStatus: "rejected", accountStatus: "suspended", rating: 3.2, sessionsCompleted: 12, earnings: 840, joinedAt: "2023-06-20", image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&auto=format&fit=crop", location: "Pune, India" },
  { id: "M008", name: "Rahul Mehta", email: "rahul.m@deloitte.com", mobile: "+91-91234-56789", company: "Deloitte", designation: "Management Consultant", category: "Consulting", verificationStatus: "verified", accountStatus: "active", rating: 4.7, sessionsCompleted: 78, earnings: 11700, joinedAt: "2023-04-15", image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&auto=format&fit=crop", location: "Mumbai, India" },
];

// ── Job Seekers ───────────────────────────────────────────────
export interface AdminJobSeeker {
  id: string;
  name: string;
  email: string;
  mobile: string;
  sessionsBooked: number;
  totalSpend: number;
  accountStatus: UserStatus;
  joinedAt: string;
  lastActive: string;
  image: string;
  location: string;
  targetRole: string;
}

export const ADMIN_JOB_SEEKERS: AdminJobSeeker[] = [
  { id: "JS001", name: "Alex Thompson", email: "alex.t@gmail.com", mobile: "+1-555-0201", sessionsBooked: 8, totalSpend: 1200, accountStatus: "active", joinedAt: "2024-01-10", lastActive: "2024-09-21", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop", location: "Chicago, IL", targetRole: "Software Engineer" },
  { id: "JS002", name: "Fatima Al-Hassan", email: "fatima.h@outlook.com", mobile: "+44-7911-123456", sessionsBooked: 3, totalSpend: 360, accountStatus: "active", joinedAt: "2024-03-22", lastActive: "2024-09-20", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&auto=format&fit=crop", location: "London, UK", targetRole: "Product Manager" },
  { id: "JS003", name: "Vikram Singh", email: "vikram.s@yahoo.com", mobile: "+91-99887-76655", sessionsBooked: 15, totalSpend: 2700, accountStatus: "active", joinedAt: "2023-11-05", lastActive: "2024-09-22", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&auto=format&fit=crop", location: "Bangalore, India", targetRole: "Data Analyst" },
  { id: "JS004", name: "Emma Clarke", email: "emma.c@proton.me", mobile: "+61-412-345-678", sessionsBooked: 1, totalSpend: 150, accountStatus: "suspended", joinedAt: "2024-07-14", lastActive: "2024-08-30", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&auto=format&fit=crop", location: "Sydney, AU", targetRole: "UX Designer" },
  { id: "JS005", name: "Carlos Mendoza", email: "carlos.m@gmail.com", mobile: "+52-55-1234-5678", sessionsBooked: 6, totalSpend: 720, accountStatus: "active", joinedAt: "2024-02-28", lastActive: "2024-09-19", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&auto=format&fit=crop", location: "Mexico City, MX", targetRole: "DevOps Engineer" },
  { id: "JS006", name: "Yuki Tanaka", email: "yuki.t@gmail.com", mobile: "+81-90-1234-5678", sessionsBooked: 0, totalSpend: 0, accountStatus: "active", joinedAt: "2024-09-18", lastActive: "2024-09-18", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&auto=format&fit=crop", location: "Tokyo, JP", targetRole: "ML Engineer" },
];

// ── Verification Requests ─────────────────────────────────────
export interface VerificationRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  company: string;
  designation: string;
  status: VerificationStatus;
  submittedAt: string;
  documents: { type: string; uploaded: boolean; verified: boolean }[];
  auditTrail: { reviewer: string; date: string; action: string; notes: string }[];
  image: string;
  linkedIn: string;
  companyEmail: string;
}

export const VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: "VER001", mentorId: "M005", mentorName: "Anita Patel", company: "Meta", designation: "Data Scientist", status: "pending", submittedAt: "2024-09-10",
    documents: [
      { type: "Employee ID Card", uploaded: true, verified: false },
      { type: "Government ID", uploaded: true, verified: false },
      { type: "Company Email Verification", uploaded: false, verified: false },
      { type: "LinkedIn Profile", uploaded: true, verified: false },
      { type: "Resume", uploaded: true, verified: false },
    ],
    auditTrail: [],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&auto=format&fit=crop",
    linkedIn: "linkedin.com/in/anitapatel", companyEmail: "anita.p@meta.com",
  },
  {
    id: "VER002", mentorId: "M006", mentorName: "James Wilson", company: "Vercel", designation: "Frontend Architect", status: "under_review", submittedAt: "2024-09-12",
    documents: [
      { type: "Employee ID Card", uploaded: true, verified: true },
      { type: "Government ID", uploaded: true, verified: true },
      { type: "Company Email Verification", uploaded: true, verified: true },
      { type: "LinkedIn Profile", uploaded: true, verified: false },
      { type: "Resume", uploaded: true, verified: false },
    ],
    auditTrail: [
      { reviewer: "Admin Kumar", date: "2024-09-13", action: "Started Review", notes: "Documents look authentic. Verifying LinkedIn." },
    ],
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&auto=format&fit=crop",
    linkedIn: "linkedin.com/in/jameswilson", companyEmail: "jwilson@vercel.com",
  },
  {
    id: "VER003", mentorId: "M007", mentorName: "Priya Sharma", company: "TCS", designation: "SAP Consultant", status: "rejected", submittedAt: "2023-06-18",
    documents: [
      { type: "Employee ID Card", uploaded: true, verified: false },
      { type: "Government ID", uploaded: true, verified: false },
      { type: "Company Email Verification", uploaded: false, verified: false },
      { type: "LinkedIn Profile", uploaded: false, verified: false },
      { type: "Resume", uploaded: true, verified: false },
    ],
    auditTrail: [
      { reviewer: "Admin Patel", date: "2023-06-20", action: "Rejected", notes: "Employee ID appears to be edited. Company email not verified." },
    ],
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&auto=format&fit=crop",
    linkedIn: "", companyEmail: "",
  },
];

// ── Sessions ──────────────────────────────────────────────────
export interface AdminSession {
  id: string;
  mentorName: string;
  mentorCompany: string;
  jobSeekerName: string;
  date: string;
  time: string;
  duration: number;
  paymentStatus: PaymentStatus;
  sessionStatus: SessionStatus;
  amount: number;
  platform: string;
}

export const ADMIN_SESSIONS: AdminSession[] = [
  { id: "SES001", mentorName: "Sarah Chen", mentorCompany: "Google", jobSeekerName: "Alex Thompson", date: "2024-09-24", time: "10:00 AM", duration: 60, paymentStatus: "success", sessionStatus: "scheduled", amount: 150, platform: "Zoom" },
  { id: "SES002", mentorName: "Marcus Johnson", mentorCompany: "Stripe", jobSeekerName: "Vikram Singh", date: "2024-09-22", time: "02:00 PM", duration: 60, paymentStatus: "success", sessionStatus: "completed", amount: 120, platform: "Google Meet" },
  { id: "SES003", mentorName: "Elena Rodriguez", mentorCompany: "Airbnb", jobSeekerName: "Fatima Al-Hassan", date: "2024-09-21", time: "11:00 AM", duration: 90, paymentStatus: "refunded", sessionStatus: "cancelled", amount: 270, platform: "Zoom" },
  { id: "SES004", mentorName: "David Kim", mentorCompany: "Netflix", jobSeekerName: "Carlos Mendoza", date: "2024-09-20", time: "04:00 PM", duration: 60, paymentStatus: "success", sessionStatus: "completed", amount: 200, platform: "Zoom" },
  { id: "SES005", mentorName: "Rahul Mehta", mentorCompany: "Deloitte", jobSeekerName: "Alex Thompson", date: "2024-09-19", time: "09:00 AM", duration: 60, paymentStatus: "pending", sessionStatus: "scheduled", amount: 150, platform: "Teams" },
  { id: "SES006", mentorName: "Sarah Chen", mentorCompany: "Google", jobSeekerName: "Emma Clarke", date: "2024-09-18", time: "03:00 PM", duration: 60, paymentStatus: "failed", sessionStatus: "no_show", amount: 150, platform: "Zoom" },
];

// ── Payments ──────────────────────────────────────────────────
export interface AdminPayment {
  id: string;
  transactionId: string;
  userName: string;
  mentorName: string;
  amount: number;
  tax: number;
  commission: number;
  status: PaymentStatus;
  date: string;
  gateway: string;
  sessionId: string;
}

export const ADMIN_PAYMENTS: AdminPayment[] = [
  { id: "PAY001", transactionId: "rzp_1A2B3C4D5E", userName: "Alex Thompson", mentorName: "Sarah Chen", amount: 150, tax: 27, commission: 22.5, status: "success", date: "2024-09-24", gateway: "Razorpay", sessionId: "SES001" },
  { id: "PAY002", transactionId: "rzp_2B3C4D5E6F", userName: "Vikram Singh", mentorName: "Marcus Johnson", amount: 120, tax: 21.6, commission: 18, status: "success", date: "2024-09-22", gateway: "Razorpay", sessionId: "SES002" },
  { id: "PAY003", transactionId: "rzp_3C4D5E6F7G", userName: "Fatima Al-Hassan", mentorName: "Elena Rodriguez", amount: 270, tax: 48.6, commission: 40.5, status: "refunded", date: "2024-09-21", gateway: "Razorpay", sessionId: "SES003" },
  { id: "PAY004", transactionId: "rzp_4D5E6F7G8H", userName: "Carlos Mendoza", mentorName: "David Kim", amount: 200, tax: 36, commission: 30, status: "success", date: "2024-09-20", gateway: "Razorpay", sessionId: "SES004" },
  { id: "PAY005", transactionId: "rzp_5E6F7G8H9I", userName: "Alex Thompson", mentorName: "Rahul Mehta", amount: 150, tax: 27, commission: 22.5, status: "pending", date: "2024-09-19", gateway: "Razorpay", sessionId: "SES005" },
  { id: "PAY006", transactionId: "rzp_6F7G8H9I0J", userName: "Emma Clarke", mentorName: "Sarah Chen", amount: 150, tax: 27, commission: 22.5, status: "failed", date: "2024-09-18", gateway: "Razorpay", sessionId: "SES006" },
];

// ── Reviews ───────────────────────────────────────────────────
export interface AdminReview {
  id: string;
  reviewerName: string;
  mentorName: string;
  rating: number;
  comment: string;
  date: string;
  status: ReviewStatus;
  sessionId: string;
}

export const ADMIN_REVIEWS: AdminReview[] = [
  { id: "REV001", reviewerName: "Vikram Singh", mentorName: "Marcus Johnson", rating: 5, comment: "Incredible session! Marcus gave me a clear roadmap for my PM transition. Highly recommend!", date: "2024-09-22", status: "visible", sessionId: "SES002" },
  { id: "REV002", reviewerName: "Carlos Mendoza", mentorName: "David Kim", rating: 5, comment: "David is an amazing mentor. His systems design tips were game-changing for my interviews.", date: "2024-09-20", status: "visible", sessionId: "SES004" },
  { id: "REV003", reviewerName: "Alex Thompson", mentorName: "Sarah Chen", rating: 2, comment: "Session was OK but felt rushed. Could have been better.", date: "2024-09-15", status: "visible", sessionId: "SES001" },
  { id: "REV004", reviewerName: "Emma Clarke", mentorName: "Priya Sharma", rating: 1, comment: "This mentor gave me completely wrong advice. Total waste of money. Also their profile picture is fake.", date: "2024-08-30", status: "flagged", sessionId: "SES006" },
  { id: "REV005", reviewerName: "Fatima Al-Hassan", mentorName: "Elena Rodriguez", rating: 5, comment: "Elena is a UX design wizard! My portfolio is 10x better after our session.", date: "2024-09-10", status: "visible", sessionId: "SES003" },
];

// ── Fraud ─────────────────────────────────────────────────────
export interface FraudRecord {
  id: string;
  userId: string;
  userName: string;
  userType: "mentor" | "jobseeker";
  riskScore: FraudRisk;
  flags: string[];
  detectedAt: string;
  status: "investigating" | "suspended" | "banned" | "cleared";
  email: string;
  mobile: string;
}

export const FRAUD_RECORDS: FraudRecord[] = [
  { id: "FRD001", userId: "M007", userName: "Priya Sharma", userType: "mentor", riskScore: "high", flags: ["Invalid Employee ID", "Duplicate email domain", "Profile image reverse-match found"], detectedAt: "2023-06-19", status: "suspended", email: "priya.s@tcs.com", mobile: "+91-98765-43210" },
  { id: "FRD002", userId: "JS004", userName: "Emma Clarke", userType: "jobseeker", riskScore: "medium", flags: ["Multiple failed payment attempts", "Unusual booking pattern (10 bookings in 1 hour)"], detectedAt: "2024-08-30", status: "suspended", email: "emma.c@proton.me", mobile: "+61-412-345-678" },
  { id: "FRD003", userId: "M099", userName: "John Fake", userType: "mentor", riskScore: "high", flags: ["Duplicate mobile number", "Stock photo detected as profile image", "LinkedIn profile created 1 day before signup", "Fake reviews detected (3 reviews from same IP)"], detectedAt: "2024-09-01", status: "banned", email: "john.fake@gmail.com", mobile: "+1-555-9999" },
  { id: "FRD004", userId: "JS099", userName: "Test Account", userType: "jobseeker", riskScore: "low", flags: ["VPN usage detected"], detectedAt: "2024-09-15", status: "investigating", email: "test@tempmail.com", mobile: "+1-000-0000" },
];

// ── Notifications ─────────────────────────────────────────────
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  audience: "all" | "mentors" | "job_seekers" | "custom";
  channels: string[];
  type: string;
  status: "sent" | "scheduled" | "draft";
  sentAt: string;
  recipients: number;
}

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  { id: "NOT001", title: "New Feature: Group Sessions Now Available", message: "We've launched group mentoring sessions! Book a group session at 40% less.", audience: "all", channels: ["email", "push"], type: "new_feature", status: "sent", sentAt: "2024-09-15", recipients: 12847 },
  { id: "NOT002", title: "Verify Your Account to Start Earning", message: "Complete your verification to unlock session bookings.", audience: "mentors", channels: ["email", "sms"], type: "verification", status: "sent", sentAt: "2024-09-12", recipients: 130 },
  { id: "NOT003", title: "Exclusive 20% Off This Weekend", message: "Book any session this weekend and get 20% off with code WEEKEND20.", audience: "job_seekers", channels: ["email", "push", "sms"], type: "promotion", status: "scheduled", sentAt: "2024-09-28", recipients: 0 },
];

// ── Companies ─────────────────────────────────────────────────
export interface AdminCompany {
  id: string;
  name: string;
  logo: string;
  industry: string;
  status: "active" | "inactive";
  mentorCount: number;
  sessionCount: number;
  addedAt: string;
}

export const ADMIN_COMPANIES: AdminCompany[] = [
  { id: "CO001", name: "Google", logo: "https://logo.clearbit.com/google.com", industry: "Technology", status: "active", mentorCount: 87, sessionCount: 1240, addedAt: "2022-10-01" },
  { id: "CO002", name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", industry: "Technology", status: "active", mentorCount: 72, sessionCount: 980, addedAt: "2022-10-01" },
  { id: "CO003", name: "Amazon", logo: "https://logo.clearbit.com/amazon.com", industry: "E-Commerce / Cloud", status: "active", mentorCount: 94, sessionCount: 1500, addedAt: "2022-10-01" },
  { id: "CO004", name: "Meta", logo: "https://logo.clearbit.com/meta.com", industry: "Social Media / AI", status: "active", mentorCount: 61, sessionCount: 820, addedAt: "2022-10-15" },
  { id: "CO005", name: "Netflix", logo: "https://logo.clearbit.com/netflix.com", industry: "Entertainment / Tech", status: "active", mentorCount: 43, sessionCount: 590, addedAt: "2022-11-01" },
  { id: "CO006", name: "TCS", logo: "https://logo.clearbit.com/tcs.com", industry: "IT Services", status: "active", mentorCount: 120, sessionCount: 2100, addedAt: "2022-10-01" },
  { id: "CO007", name: "Infosys", logo: "https://logo.clearbit.com/infosys.com", industry: "IT Services", status: "active", mentorCount: 98, sessionCount: 1800, addedAt: "2022-10-01" },
  { id: "CO008", name: "Deloitte", logo: "https://logo.clearbit.com/deloitte.com", industry: "Consulting", status: "active", mentorCount: 76, sessionCount: 1100, addedAt: "2022-10-01" },
  { id: "CO009", name: "Stripe", logo: "https://logo.clearbit.com/stripe.com", industry: "Fintech", status: "active", mentorCount: 29, sessionCount: 380, addedAt: "2023-01-01" },
  { id: "CO010", name: "Airbnb", logo: "https://logo.clearbit.com/airbnb.com", industry: "Travel / Tech", status: "inactive", mentorCount: 18, sessionCount: 210, addedAt: "2023-03-01" },
];

// ── Support Tickets ───────────────────────────────────────────
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userType: "mentor" | "jobseeker";
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  messages: { sender: string; message: string; timestamp: string }[];
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "TKT001", userId: "JS001", userName: "Alex Thompson", userType: "jobseeker",
    subject: "Payment deducted but session not confirmed", priority: "high", status: "open",
    createdAt: "2024-09-22", updatedAt: "2024-09-22", assignedTo: "Unassigned",
    messages: [{ sender: "Alex Thompson", message: "I paid ₹150 for a session with Sarah Chen but I still see it as pending. Please help!", timestamp: "2024-09-22 10:30" }],
  },
  {
    id: "TKT002", userId: "M007", userName: "Priya Sharma", userType: "mentor",
    subject: "My account was suspended without notice", priority: "critical", status: "in_progress",
    createdAt: "2024-09-19", updatedAt: "2024-09-21", assignedTo: "Admin Kumar",
    messages: [
      { sender: "Priya Sharma", message: "My account is suspended and I can't accept sessions. No email was sent.", timestamp: "2024-09-19 14:00" },
      { sender: "Admin Kumar", message: "We have flagged your account for verification issues. Please submit valid documents.", timestamp: "2024-09-21 11:00" },
    ],
  },
  {
    id: "TKT003", userId: "JS003", userName: "Vikram Singh", userType: "jobseeker",
    subject: "Can I get a refund for cancelled session?", priority: "medium", status: "resolved",
    createdAt: "2024-09-18", updatedAt: "2024-09-20", assignedTo: "Admin Patel",
    messages: [
      { sender: "Vikram Singh", message: "My session with Elena was cancelled. Can I get a refund?", timestamp: "2024-09-18 09:00" },
      { sender: "Admin Patel", message: "Refund has been processed. It will reflect in 3-5 business days.", timestamp: "2024-09-20 10:00" },
    ],
  },
];

// ── Analytics Data ────────────────────────────────────────────
export const CONVERSION_FUNNEL = [
  { stage: "Visitors", value: 50000 },
  { stage: "Registrations", value: 12847 },
  { stage: "Browsed Mentors", value: 9200 },
  { stage: "Booked Sessions", value: 4100 },
  { stage: "Paid", value: 3800 },
];

export const TOP_SEARCHED_ROLES = [
  { role: "Software Engineer", searches: 4200 },
  { role: "Data Analyst", searches: 3100 },
  { role: "Product Manager", searches: 2800 },
  { role: "SAP Consultant", searches: 1900 },
  { role: "UX Designer", searches: 1600 },
  { role: "DevOps Engineer", searches: 1200 },
  { role: "ML Engineer", searches: 980 },
];

export const TOP_BOOKED_COMPANIES = [
  { company: "Amazon", bookings: 1500 },
  { company: "TCS", bookings: 2100 },
  { company: "Infosys", bookings: 1800 },
  { company: "Deloitte", bookings: 1100 },
  { company: "Google", bookings: 1240 },
  { company: "Microsoft", bookings: 980 },
];

export const USER_RETENTION = [
  { week: "W1", retention: 100 },
  { week: "W2", retention: 68 },
  { week: "W3", retention: 52 },
  { week: "W4", retention: 44 },
  { week: "W8", retention: 31 },
  { week: "W12", retention: 24 },
];
