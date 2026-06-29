import { AdminLayout } from "@/components/admin/AdminLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | CareerConnect",
  description: "Super Admin panel for CareerConnect platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // In a real app, this would use a layout context or route matching to pass dynamic titles
  return <AdminLayout title="Admin Portal">{children}</AdminLayout>;
}
