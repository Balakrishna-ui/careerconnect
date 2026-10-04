import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Support Tickets...");

  // Fetch some users and mentors to link
  const users = await prisma.user.findMany({ take: 5 });
  const mentors = await prisma.mentor.findMany({ take: 5, include: { user: true } });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  let bookings = await prisma.booking.findMany({ take: 5 });

  if (users.length === 0 || mentors.length === 0) {
    console.log("Not enough users or mentors in DB to create realistic tickets.");
    return;
  }

  // Create a dummy booking if none exist
  if (bookings.length === 0) {
    const booking = await prisma.booking.create({
      data: {
        userId: users[0].id,
        mentorId: mentors[0].id,
        status: "COMPLETED",
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
        price: 100,
        meetingLink: "https://zoom.us/j/123456789",
      }
    });
    bookings = [booking, booking, booking, booking, booking, booking];
  }

  // Fallback if less than 6 bookings
  while (bookings.length < 6) {
    bookings.push(bookings[0]);
  }

  const tickets = [
    {
      category: "Mentor didn't respond",
      description: "I tried reaching out to my mentor for the upcoming session, but no response for 3 days.",
      status: "OPEN",
      priority: "HIGH",
      userId: users[0].id,
      mentorId: mentors[0].id,
      bookingId: bookings[0].id,
    },
    {
      category: "Meeting link not working",
      description: "When I click the join session button, it says invalid link.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      userId: users[1].id,
      mentorId: mentors[1].id,
      bookingId: bookings[1].id,
      assignedToId: admins[0]?.id,
    },
    {
      category: "Other",
      description: "I need to reschedule but the button is greyed out.",
      status: "OPEN",
      priority: "MEDIUM",
      userId: users[2].id,
      mentorId: mentors[0].id,
      bookingId: bookings[2].id,
    },
    {
      category: "Payment issue",
      description: "My card was charged twice for the last booking.",
      status: "RESOLVED",
      priority: "CRITICAL",
      userId: users[3].id,
      mentorId: mentors[2].id,
      bookingId: bookings[3].id,
      assignedToId: admins[0]?.id,
    },
    {
      category: "Mentor didn't join",
      description: "I waited 20 minutes but the mentor never showed up.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      userId: users[4].id,
      mentorId: mentors[3].id,
      bookingId: bookings[4].id,
      assignedToId: admins[0]?.id,
    },
    {
      category: "Technical issue",
      description: "The video call quality is very poor.",
      status: "RESOLVED",
      priority: "LOW",
      userId: users[1].id,
      mentorId: mentors[2].id,
      bookingId: bookings[5].id,
    },
  ];

  for (const t of tickets) {
    const ticket = await prisma.supportTicket.create({
      data: t,
    });
    
    // Add some initial messages
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: t.userId,
        senderRole: "USER",
        message: t.description,
      }
    });

    if (t.status === "IN_PROGRESS" || t.status === "RESOLVED") {
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: admins[0]?.id || users[0].id,
          senderRole: "ADMIN",
          message: "We are looking into this immediately.",
        }
      });
    }

    if (t.status === "RESOLVED") {
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: admins[0]?.id || users[0].id,
          senderRole: "ADMIN",
          message: "This issue has been resolved. A refund was processed.",
        }
      });
    }
  }

  console.log("Successfully seeded support tickets!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
