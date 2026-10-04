import { SupportTicketsClient } from "./SupportTicketsClient";
import { getAdminSupportData, getAdmins } from "@/actions/support-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const params = await searchParams;
    const search = typeof params?.search === "string" ? params.search : "";
    const status = typeof params?.status === "string" ? params.status : "ALL";
    const sort = typeof params?.sort === "string" ? params.sort : "newest";
    const page = typeof params?.page === "string" ? parseInt(params.page) : 1;
    const ticketId = typeof params?.ticketId === "string" ? params.ticketId : undefined;

    const [data, admins] = await Promise.all([
      getAdminSupportData({ search, status, page, sort, limit: 25 }),
      getAdmins(),
    ]);

    return (
      <SupportTicketsClient 
        initialData={data} 
        admins={admins}
        searchParams={{ search, status, page, sort, ticketId }}
      />
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      redirect("/login");
    }
    return <div>Failed to load support data.</div>;
  }
}
