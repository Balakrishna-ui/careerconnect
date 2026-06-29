"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { BriefcaseBusiness, Menu } from "lucide-react"
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  
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
            <Link href="/mentors" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname?.startsWith("/mentors") && "text-foreground after:w-full")}>
              Find Mentors
            </Link>
            <Link href="/companies" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname?.startsWith("/companies") && "text-foreground after:w-full")}>
              Companies
            </Link>
            <Link href="/about" className={cn("transition-colors hover:text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300", pathname === "/about" && "text-foreground after:w-full")}>
              About Us
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3">
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold")}>
              Get Started
            </Link>
          </div>
          <Button variant="outline" size="icon" className="md:hidden rounded-lg">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

