import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BriefcaseBusiness } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignupPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Left Side (Image/Gradient) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-blue-600/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay" />
        
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BriefcaseBusiness className="mr-2 h-6 w-6" />
          CareerConnect
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Being a mentor on CareerConnect has been incredibly rewarding. I've helped dozens of junior engineers level up their careers while also earning a significant side income."
            </p>
            <footer className="text-sm text-zinc-300">David Kim, Engineering Manager</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="lg:p-8 flex items-center justify-center w-full min-h-screen lg:min-h-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[400px]">
          
          <div className="flex lg:hidden items-center justify-center mb-2">
            <div className="bg-primary p-2 rounded-xl">
              <BriefcaseBusiness className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join the world's most trusted professional network
            </p>
          </div>
          
          <Tabs defaultValue="jobseeker" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="jobseeker"
                className="rounded-lg font-semibold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
              >
                💼 Job Seeker
              </TabsTrigger>
              <TabsTrigger
                value="mentor"
                className="rounded-lg font-semibold transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground"
              >
                🎓 Mentor
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobseeker">
              <div className="grid gap-6">
                <form>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="name@example.com" type="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" />
                    </div>
                    <Link href="/dashboard" className={cn(buttonVariants(), "w-full mt-2")}>
                      Create Account
                    </Link>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="mentor">
              <div className="grid gap-6">
                <form>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="m-first-name">First name</Label>
                        <Input id="m-first-name" placeholder="Jane" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="m-last-name">Last name</Label>
                        <Input id="m-last-name" placeholder="Smith" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="work-email">Work Email (Required for Verification)</Label>
                      <Input id="work-email" placeholder="jane@google.com" type="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="m-password">Password</Label>
                      <Input id="m-password" type="password" />
                    </div>
                    <Link href="/mentor-dashboard" className={cn(buttonVariants(), "w-full mt-2")}>
                      Apply as Mentor
                    </Link>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" className="w-full">
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" className="w-full">
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </Button>
          </div>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
