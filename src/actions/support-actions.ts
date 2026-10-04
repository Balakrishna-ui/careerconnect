"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

export async function getAdminSupportData({
  search = "",
  status = "ALL",
  page = 1,
  limit = 25,
  sort = "newest",
}: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  await requireAdmin();

  const where: any = {};

  if (status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { bookingId: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { mentor: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  let orderBy: any = {};
  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "priority":
      // Priority sorting might be tricky since it's a string. We can sort by priority but it'll be alphabetical.
      // For a true priority sort, we might need a custom raw query or just sort by updatedAt for now.
      // To keep it simple, we sort by updatedAt desc.
      orderBy = { updatedAt: "desc" };
      break;
    case "status":
      orderBy = { status: "asc" };
      break;
    case "updated":
      orderBy = { updatedAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * limit;

  const [tickets, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true, image: true } },
        mentor: { select: { name: true, user: { select: { email: true } } } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  // Fetch Analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [openCount, inProgressCount, resolvedTodayCount, criticalCount] = await Promise.all([
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.supportTicket.count({ 
      where: { 
        status: "RESOLVED",
        updatedAt: { gte: today }
      } 
    }),
    prisma.supportTicket.count({ where: { priority: "CRITICAL" } }),
  ]);

  return {
    tickets,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    analytics: {
      open: openCount,
      inProgress: inProgressCount,
      resolvedToday: resolvedTodayCount,
      critical: criticalCount,
    },
  };
}

export async function getTicketDetails(ticketId: string) {
  await requireAdmin();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { name: true, email: true, image: true } },
      mentor: { select: { name: true, user: { select: { email: true } } } },
      assignedTo: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { name: true, image: true, role: true } },
        },
      },
    },
  });

  return ticket;
}
export async function replyToTicket(ticketId: string, message: string, attachmentUrl?: string) {
  const sessionUser = await requireAdmin();

  const reply = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: sessionUser.id,
      senderRole: "ADMIN",
      message,
      attachmentUrl,
    },
  });

  // Optionally update ticket status to IN_PROGRESS if it was OPEN
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (ticket && ticket.status === "OPEN") {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS" },
    });
  }

  revalidatePath("/admin/support");
  return reply;
}

export async function updateTicketStatus(ticketId: string, status: string) {
  await requireAdmin();

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath("/admin/support");
  return ticket;
}

export async function updateTicketPriority(ticketId: string, priority: string) {
  await requireAdmin();

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { priority },
  });

  revalidatePath("/admin/support");
  return ticket;
}

export async function assignTicket(ticketId: string, adminId: string | null) {
  await requireAdmin();

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assignedToId: adminId },
  });

  revalidatePath("/admin/support");
  return ticket;
}

export async function getAdmins() {
  await requireAdmin();

  return prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });
}
