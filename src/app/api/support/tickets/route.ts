import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { bookingId, category, description, attachment } = body;

    if (!bookingId || !category || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create Support Ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        mentorId: booking.mentorId,
        category,
        description,
        attachment: attachment || null,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      status: ticket.status,
      message: "Ticket created successfully",
    });
  } catch (error) {
    console.error("[SUPPORT_TICKET_CREATE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
