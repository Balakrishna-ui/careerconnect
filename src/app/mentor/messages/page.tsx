import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function MentorMessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "MENTOR") {
    redirect("/signup?view=login");
  }

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Communicate with your mentees.</p>
      </div>

      <Card className="flex-1 border-none shadow-sm flex items-center justify-center">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            When mentees reach out to you or book a session, their messages will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
