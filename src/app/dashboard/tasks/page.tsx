import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TasksClient from "@/components/dashboard/TasksClient";

export const metadata = {
  title: "My Tasks | CareerConnect",
  description: "Manage your personal tasks and goals.",
};

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <TasksClient />;
}
