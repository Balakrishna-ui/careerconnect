import { ReactNode } from "react";
import Link from "next/link";
import { Check, User, GraduationCap, Briefcase, FileText, LayoutTemplate } from "lucide-react";

export default function MentorRegisterLayout({ children }: { children: ReactNode }) {
  // We can't use usePathname here since it's a client hook and layout might be a server component,
  // but let's make the layout a client component just for the navigation active state.
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simple Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-bold text-xl text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          CareerConnect
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col pt-8 pb-20 px-4">
        {/* We'll render the Progress indicator in the child pages because we need access to the current route easily, 
            or we can make a client component here. Let's make a separate client component for the progress bar. */}
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
