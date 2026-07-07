import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ message: "Reset link sent if email exists" }, { status: 200 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Save token in the database
    // Note: NextAuth's VerificationToken requires an identifier (usually email)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send the email using Nodemailer
    const resetLink = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Import dynamically or assume it's imported at the top. Wait, better to import at top. Let me change the whole file import if needed.
    // I will just use the utility here.
    const { sendPasswordResetEmail } = await import("@/lib/email");
    const emailResult = await sendPasswordResetEmail(email, resetLink, user.name || "User");
    
    if (!emailResult.success) {
      console.error("Failed to send reset email", emailResult.error);
      // We still return 200 to prevent email enumeration, but log the error.
    }

    return NextResponse.json(
      { message: "Reset link sent if email exists" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
