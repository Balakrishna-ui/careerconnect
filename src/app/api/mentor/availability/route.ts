import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
      include: {
        weeklySchedules: true,
      },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor profile not found" }, { status: 404 });
    }

    return NextResponse.json({ weeklySchedules: mentor.weeklySchedules }, { status: 200 });
  } catch (error) {
    console.error("Fetch availability error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching availability" },
      { status: 500 }
    );
  }
}

// Basic POST for saving schedules (simplification for dashboard wire-up)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor profile not found" }, { status: 404 });
    }

    const data = await request.json(); // Array of schedule objects
    
    // Clear existing schedules for this mentor
    await prisma.weeklySchedule.deleteMany({
      where: { mentorId: mentor.id }
    });

    // Create new schedules
    if (Array.isArray(data)) {
      await prisma.weeklySchedule.createMany({
        data: data.map(schedule => ({
          ...schedule,
          mentorId: mentor.id,
        })),
      });
    }

    return NextResponse.json({ message: "Availability updated" }, { status: 200 });
  } catch (error) {
    console.error("Update availability error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating availability" },
      { status: 500 }
    );
  }
}
