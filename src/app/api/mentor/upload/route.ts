import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // In a real application with Vercel Blob:
    // import { put } from '@vercel/blob';
    // const blob = await put(file.name, file, { access: 'public' });
    // const fileUrl = blob.url;

    // For this demonstration (since we don't have actual keys configured),
    // we'll simulate a successful upload and use a placeholder URL.
    const fileUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`;

    // Optionally update the mentor's image if requested
    const type = formData.get("type"); // 'profile' or 'cover'
    if (type === "profile") {
      await prisma.mentor.update({
        where: { id: mentor.id },
        data: { image: fileUrl },
      });
      // Also update User image
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: fileUrl },
      });
    }

    return NextResponse.json({ 
      message: "File uploaded successfully (simulated)", 
      url: fileUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "An error occurred during upload" },
      { status: 500 }
    );
  }
}
