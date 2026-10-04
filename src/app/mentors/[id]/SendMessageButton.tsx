"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getOrCreateConversation } from "@/actions/message-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";

interface SendMessageButtonProps {
  mentorUserId: string;
  isAuthenticated: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function SendMessageButton({
  mentorUserId,
  isAuthenticated,
  className,
  children,
}: SendMessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const { conversationId } = await getOrCreateConversation(mentorUserId);
      router.push(`/dashboard/messages?conversationId=${conversationId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className={cn(
        "w-full h-11 text-sm text-blue-600 border-blue-200/80 bg-background hover:bg-blue-50/60 hover:text-blue-700 font-semibold transition-colors shadow-xs",
        className
      )}
      onClick={handleMessageClick}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Send a Message
        </span>
      )}
    </Button>
  );
}
