import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function MentorRegistrationSuccessPage() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Registration Successful!</h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Thank you for applying to be a mentor on CareerConnect. Your application is currently under review by our admin team. You will receive an email once your profile has been approved.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Return to Home
            </Button>
          </Link>
          <Link href="/mentors">
            <Button variant="outline" className="w-full h-12 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
              Browse Other Mentors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
