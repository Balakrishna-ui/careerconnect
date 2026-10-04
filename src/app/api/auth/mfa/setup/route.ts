import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, generateURI } from "otplib";
import qrcode from "qrcode";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateSecret();
    const email = session.user.email || "user@careerconnect.com";
    const otpauth = generateURI({ label: email, issuer: "CareerConnect", secret });
    
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Temporarily save secret to DB (user needs to verify it to enable)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaSecret: secret }
    });

    return NextResponse.json({ secret, qrCodeUrl });
  } catch (error) {
    console.error("MFA Setup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
