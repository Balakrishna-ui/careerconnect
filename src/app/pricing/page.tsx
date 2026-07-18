"use client";

import { useSession } from "next-auth/react";
import { CheckCircle2, Zap, Star, LayoutDashboard } from "lucide-react";
import { RazorpayButton } from "@/components/payment/RazorpayButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const { data: session } = useSession();
  
  const isPremium = session?.user?.premium;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Accelerate Your Career with <span className="text-blue-600">Pro</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get exclusive discounts, priority booking, and premium mentorship tools to land your dream job faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Tier</h3>
            <p className="text-sm text-gray-500 mb-6">For those just exploring.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">Free</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
                Browse Mentor Directory
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
                Book Paid Sessions
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700 opacity-50">
                <CheckCircle2 className="w-5 h-5 text-gray-300 shrink-0" />
                No Booking Fees
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700 opacity-50">
                <CheckCircle2 className="w-5 h-5 text-gray-300 shrink-0" />
                Priority Mentorship Queue
              </li>
            </ul>

            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full py-6 rounded-xl font-bold text-gray-700 border-gray-300">
                Current Plan
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-3xl p-8 border border-blue-800 shadow-2xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-current" /> MOST POPULAR
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">CareerConnect Pro</h3>
            <p className="text-sm text-blue-200 mb-6">For serious job seekers.</p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹99</span>
              <span className="text-blue-300 text-sm font-medium">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-blue-50">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Everything in Basic
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400/20" />
                10% Off All Mentor Sessions
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-50">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Waived Platform Fees
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-50">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Priority Mentor Responses
              </li>
            </ul>

            {isPremium ? (
              <Link href="/dashboard" className="w-full">
                <Button className="w-full py-6 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> You are a Pro Member
                </Button>
              </Link>
            ) : (
              <RazorpayButton
                amount={99}
                type="PREMIUM_UNLOCK"
                buttonText="Upgrade to Pro"
                className="w-full py-6 rounded-xl font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-lg transition-colors border-0"
                onSuccess={() => {
                  window.location.href = "/dashboard?upgraded=true";
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
