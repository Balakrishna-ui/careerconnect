"use client";

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { BriefcaseBusiness, Menu, LogOut, User, X, Crown, ChevronRight, Settings, HelpCircle, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { JobSeekerAccountDrawer } from "@/components/layout/JobSeekerAccountDrawer";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (pathname?.startsWith("/admin") || pathname?.includes("/invoice") || pathname === "/mentor" || pathname?.startsWith("/mentor/") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl border-border/40 shadow-sm transition-all duration-300 print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            href={
              session?.user?.role === "MENTOR" ? "/mentor/dashboard" : 
              session?.user?.role === "JOB_SEEKER" ? "/dashboard" : 
              session?.user?.role === "ADMIN" ? "/admin" : 
              "/"
            } 
            className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
          >
            <div className="bg-primary p-2 rounded-xl shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <BriefcaseBusiness className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl tracking-tight hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              CareerConnect
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            {session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN" && (
              <>
                <Link href="/mentors" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname?.startsWith("/mentors") && "text-foreground after:w-full")}>
                  Find Mentors
                </Link>
                <Link href="/companies" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname?.startsWith("/companies") && "text-foreground after:w-full")}>
                  Companies
                </Link>
                <Link href="/about" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname === "/about" && "text-foreground after:w-full")}>
                  About Us
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
            ) : session ? (
              <>
                <NotificationDropdown />
                {session.user?.role === "JOB_SEEKER" ? (
                  <JobSeekerAccountDrawer session={session} />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">{session.user?.name?.split(' ')[0]}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-xl overflow-hidden border border-border">
                      {/* Top Section */}
                      <div className="p-4 bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20">
                        <div className="flex items-center gap-4">
                          {/* Circular Progress Avatar Placeholder */}
                          <div className="relative">
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted/30" />
                              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="164" strokeDashoffset="46" className="text-orange-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-background text-[10px] font-bold text-orange-600 border border-orange-200 rounded-full px-1">
                              72%
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-foreground leading-tight">{session.user?.name || "User"}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {session.user?.role === "MENTOR" ? "Mentor at CareerConnect" : session.user?.role === "ADMIN" ? "System Administrator" : "Professional"}
                            </p>
                            <Link 
                              href={session.user?.role === "MENTOR" ? "/mentor/profile" : session.user?.role === "JOB_SEEKER" ? "/dashboard/profile" : "/admin"} 
                              className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1.5 inline-block hover:underline"
                            >
                              View & Update Profile
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-2">
                        {/* Upgrade Banner */}
                        <div className="mt-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/20 border border-orange-100 dark:border-orange-900/50 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-2">
                            <div className="bg-orange-500 rounded-full p-1">
                               <Crown className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Upgrade to Pro</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Profile Performance */}
                        <div className="mt-4">
                          <h5 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                            Your profile performance
                            <span className="font-normal text-muted-foreground">Last 90 days</span>
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-border/50">
                            <div className="border-r border-border/50">
                              <div className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                                4 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Search Appearances</p>
                              <Link href="#" className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline">View all</Link>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                                5 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Recruiter Actions</p>
                              <Link href="#" className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline">View all</Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="mt-2 opacity-50" />
                      
                      <div className="py-1">
                        <DropdownMenuItem className="cursor-pointer py-2 px-4 focus:bg-accent/50" onClick={() => router.push(session.user?.role === "MENTOR" ? "/mentor/dashboard" : "/dashboard")}>
                          <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </DropdownMenuItem>
                        
                        {session.user?.role === "ADMIN" && (
                          <DropdownMenuItem className="cursor-pointer py-2 px-4 focus:bg-accent/50" onClick={() => router.push("/admin")}>
                            <BriefcaseBusiness className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Admin Panel</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="cursor-pointer py-2 px-4 focus:bg-accent/50" onClick={() => router.push("/settings")}>
                          <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Settings</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem className="cursor-pointer py-2 px-4 focus:bg-accent/50" onClick={() => router.push("/faqs")}>
                          <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">FAQs</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 py-2 px-4"
                          onClick={() => signOut({ callbackUrl: '/' })}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/signup?view=login" 
                  onClick={(e) => {
                    if (pathname === '/signup') {
                      e.preventDefault();
                      window.dispatchEvent(new Event('openLogin'));
                    }
                  }}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3"
                >
                  Log in
                </Link>
                <Link href="/signup" className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold")}>
                  Get Started
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 space-y-4">
            {session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN" && (
              <>
                <Link 
                  href="/mentors" 
                  className={cn("text-sm font-semibold p-2 rounded-md hover:bg-muted", pathname?.startsWith("/mentors") && "bg-muted text-primary")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Mentors
                </Link>
                <Link 
                  href="/companies" 
                  className={cn("text-sm font-semibold p-2 rounded-md hover:bg-muted", pathname?.startsWith("/companies") && "bg-muted text-primary")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Companies
                </Link>
                <Link 
                  href="/about" 
                  className={cn("text-sm font-semibold p-2 rounded-md hover:bg-muted", pathname === "/about" && "bg-muted text-primary")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </>
            )}
            {!session && (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Link 
                  href="/signup?view=login"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/signup"
                  className={cn(buttonVariants({ variant: "default" }), "w-full")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

