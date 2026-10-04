import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionsClient from "@/components/dashboard/SubscriptionsClient";

export const metadata = {
  title: "My Subscription | CareerConnect",
  description: "Manage your CareerConnect membership and billing.",
};

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <SubscriptionsClient />;
}
