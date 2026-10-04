import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentsClient from "@/components/dashboard/DocumentsClient";

export const metadata = {
  title: "My Documents | CareerConnect",
  description: "Manage your resumes, cover letters, and portfolios.",
};

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DocumentsClient />;
}
