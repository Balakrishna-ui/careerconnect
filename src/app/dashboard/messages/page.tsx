import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesClient } from "@/components/messages/MessagesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | CareerConnect",
  description: "Chat with mentors",
};

export default async function JobSeekerMessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <MessagesClient currentUserId={session.user.id} />;
}
