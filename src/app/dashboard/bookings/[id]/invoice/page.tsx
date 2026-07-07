import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PrintButton } from "./PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signup?view=login");
  }
  
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: {
      id: id,
      userId: session.user.id
    },
    include: {
      mentor: true,
      payment: true,
      user: true,
    }
  });

  if (!booking) {
    notFound();
  }

  const shortId = `BK-${booking.id.slice(-8).toUpperCase()}`;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black print:p-0 print:w-full">
      <div className="flex justify-between items-start mb-12 border-b pb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">INVOICE</h1>
          <p className="text-gray-500">#{shortId}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">CareerConnect</h2>
          <p className="text-gray-500">support@careerconnect.com</p>
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Billed To:</h3>
          <p className="font-semibold">{booking.user.name}</p>
          <p className="text-gray-600">{booking.user.email}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-gray-700 mb-2">Payment Details:</h3>
          <p><span className="font-semibold">Date:</span> {format(new Date(booking.createdAt), 'MMM d, yyyy')}</p>
          <p><span className="font-semibold">Status:</span> {booking.payment?.status || 'PAID'}</p>
          <p><span className="font-semibold">Transaction ID:</span> {booking.payment?.razorpayPaymentId || 'N/A'}</p>
        </div>
      </div>

      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 text-left font-bold text-gray-700">Description</th>
            <th className="py-3 text-right font-bold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-4">
              <p className="font-semibold">1:1 Mentorship Session with {booking.mentor.name}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(booking.date), 'MMMM d, yyyy')} | {format(new Date(booking.startTime), 'h:mm a')}
              </p>
            </td>
            <td className="py-4 text-right">
              ₹{((booking.payment?.amount || booking.price || 0) / 100).toLocaleString('en-IN')}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td className="py-4 font-bold text-right text-gray-700">Total:</td>
            <td className="py-4 font-bold text-right text-xl text-primary">
              ₹{((booking.payment?.amount || booking.price || 0) / 100).toLocaleString('en-IN')}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="text-center mt-16 text-gray-500 text-sm print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
