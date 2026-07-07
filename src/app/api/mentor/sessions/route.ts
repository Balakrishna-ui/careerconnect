import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
      include: {
        sessionTypes: true,
      },
    });

    if (!mentor) {
      return NextResponse.json({ message: "Mentor profile not found" }, { status: 404 });
    }

    return NextResponse.json({ sessionTypes: mentor.sessionTypes }, { status: 200 });
  } catch (error) {
    console.error("Fetch session types error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching session types" },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();

    const newSessionType = await prisma.sessionType.create({
      data: {
        mentorId: mentor.id,
        title: data.title,
        duration: data.duration,
        price: data.price,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Session type created", sessionType: newSessionType }, { status: 201 });
  } catch (error) {
    console.error("Create session type error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating session type" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "MENTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentor) {
      console.log("Mentor profile not found for user ID:", session.user.id);
      return NextResponse.json({ message: "Mentor profile not found" }, { status: 404 });
    }

    // Verify the session belongs to this mentor before deleting
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: sessionId },
    });

    if (!sessionType) {
      return NextResponse.json({ error: "Session type not found" }, { status: 404 });
    }

    if (sessionType.mentorId !== mentor.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.sessionType.delete({
      where: { id: sessionId },
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Session type deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete session type error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting session type" },
      { status: 500 }
    );
  }
}

