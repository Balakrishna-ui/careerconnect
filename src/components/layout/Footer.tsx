"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BriefcaseBusiness, Globe, Mail } from "lucide-react"

export function Footer() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin") || pathname?.endsWith("/invoice")) {
    return null;
  }

  return (
    <footer className="border-t bg-muted/40 py-12 md:py-16 print:hidden">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 w-full max-w-5xl">
          <div className="col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <BriefcaseBusiness className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">CareerConnect</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 mx-auto md:mx-0">
              Connect with verified professionals from top companies for guidance, interview prep, and mentorship.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground flex flex-col items-center">
              <li><Link href="/mentors" className="hover:text-primary transition-colors">Browse Mentors</Link></li>
              <li><Link href="/companies" className="hover:text-primary transition-colors">Companies</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/signup" className="hover:text-primary transition-colors">Become a Mentor</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground flex flex-col items-center">
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-primary transition-colors">Interview Guides</Link></li>
              <li><Link href="/resume" className="hover:text-primary transition-colors">Resume Templates</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground flex flex-col items-center">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="w-full max-w-5xl pt-8 border-t flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CareerConnect Inc. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Designed with</span>
            <span className="text-red-500">♥</span>
            <span>for professionals</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
