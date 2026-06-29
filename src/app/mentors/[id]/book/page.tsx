import BookingPageClient from "@/components/booking/BookingPageClient";

export default async function BookSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BookingPageClient mentorId={id} />;
}
