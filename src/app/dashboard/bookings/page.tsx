import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookingsClient from "@/components/dashboard/BookingsClient";
import { getJobSeekerBookingsAction } from "@/actions/booking-actions";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/signup?view=login");
  }

  const initialBookings = await getJobSeekerBookingsAction(session.user.id);

  return <BookingsClient initialData={initialBookings} userId={session.user.id} />;
}

