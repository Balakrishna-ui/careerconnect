import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ savedMentorIds: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        savedMentors: {
          select: {
            mentorId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ savedMentorIds: [] });
    }

    const savedMentorIds = user.savedMentors.map((sm) => sm.mentorId);

    return NextResponse.json({ savedMentorIds });
  } catch (error) {
    console.error("Error fetching saved mentors:", error);
    return NextResponse.json({ savedMentorIds: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "You must be logged in to save mentors", requiresAuth: true },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { mentorId } = body;

    if (!mentorId) {
      return NextResponse.json({ message: "Mentor ID is required" }, { status: 400 });
    }

    // Verify mentor exists
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 });
    }

    // Check if already saved
    const existing = await prisma.savedMentor.findUnique({
      where: {
        userId_mentorId: {
          userId: user.id,
          mentorId,
        },
      },
    });

    if (existing) {
      // Toggle off: remove
      await prisma.savedMentor.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: "Mentor removed from saved" });
    } else {
      // Toggle on: save
      await prisma.savedMentor.create({
        data: {
          userId: user.id,
          mentorId,
        },
      });
      return NextResponse.json({ saved: true, message: "Mentor saved successfully" });
    }
  } catch (error) {
    console.error("Error toggling saved mentor:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
