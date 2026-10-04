import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id } = resolvedParams;

    // Verify ownership
    const savedMentor = await prisma.savedMentor.findUnique({
      where: { id },
    });

    if (!savedMentor) {
      return NextResponse.json({ message: "Saved mentor not found" }, { status: 404 });
    }

    if (savedMentor.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await prisma.savedMentor.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Saved mentor removed successfully" });
  } catch (error) {
    console.error("Error removing saved mentor:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
