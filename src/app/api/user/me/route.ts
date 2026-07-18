import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        savedMentors: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            mentor: { select: { name: true, role: true, company: true } }
          }
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const now = new Date();
    
    // Upcoming: Confirmed and start time in future
    const upcomingSessions = user.bookings.filter(
      (b) => b.status === "CONFIRMED" && new Date(b.startTime) > now
    );

    // Completed: Status COMPLETED or start time in past with CONFIRMED
    const completedSessions = user.bookings.filter(
      (b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && new Date(b.startTime) <= now)
    );

    // Recent Activity: combine last few bookings
    const recentActivity = user.bookings.slice(0, 5).map(b => ({
      type: 'BOOKING',
      title: `Booking with ${b.mentor?.name || 'Mentor'}`,
      date: b.createdAt,
      status: b.status
    }));

    let completion = 0;
    if (user.name) completion += 25;
    if (user.email) completion += 25;
    if (user.mobile) completion += 25;
    if (user.image) completion += 25;
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || session.user.image,
      },
      stats: {
        completion,
        upcomingSessionsCount: upcomingSessions.length,
        completedSessionsCount: completedSessions.length,
        savedMentorsCount: user.savedMentors.length,
      },
      recentActivity
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch user stats error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching user stats" },
      { status: 500 }
    );
  }
}
