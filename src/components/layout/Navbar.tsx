"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { BriefcaseBusiness, Menu, LogOut, User, X } from "lucide-react"
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { JobSeekerAccountDrawer } from "@/components/layout/JobSeekerAccountDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl border-border/40 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
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
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
            ) : session ? (
              <>
                {session.user?.role === "JOB_SEEKER" ? (
                  <JobSeekerAccountDrawer session={session} />
                ) : (
                  <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" size="sm" className="rounded-full gap-2" />
                  }>
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{session.user?.name?.split(' ')[0]}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                  
                  {session.user?.role === "MENTOR" ? (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Mentor Dashboard</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/mentor/dashboard" className="cursor-pointer w-full" />}>
                        Overview
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/profile" className="cursor-pointer w-full" />}>
                        Profile Management
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/session-pricing" className="cursor-pointer w-full" />}>
                        Session Types & Pricing
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/availability" className="cursor-pointer w-full" />}>
                        Availability
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/bookings" className="cursor-pointer w-full" />}>
                        Bookings / Sessions
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/earnings" className="cursor-pointer w-full" />}>
                        Earnings
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/mentor/reviews" className="cursor-pointer w-full" />}>
                        Reviews
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/messages" className="cursor-pointer w-full" />}>
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/settings" className="cursor-pointer w-full" />}>
                        Settings
                      </DropdownMenuItem>
                    </>
                  ) : session.user?.role === "ADMIN" ? (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/admin/dashboard" className="cursor-pointer w-full" />}>
                        Dashboard
                      </DropdownMenuItem>
                    </>
                  ) : null}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
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
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
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

