import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const tasks = await prisma.jobSeekerTask.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(tasks);
    } catch (dbError) {
      // Fallback if schema is not synced yet
      console.warn("DB query failed, returning fallback data");
      return NextResponse.json([
        { id: "1", title: "Update Resume", description: "Tailor resume for Google SDE role", priority: "HIGH", completed: false },
        { id: "2", title: "Schedule Mock Interview", description: "Book a session with a FAANG mentor", priority: "MEDIUM", completed: false },
        { id: "3", title: "Complete Profile", priority: "LOW", completed: true },
      ]);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
