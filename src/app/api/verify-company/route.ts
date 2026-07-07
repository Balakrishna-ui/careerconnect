import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, otp } = body;

    if (action === "send_otp") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
      }

      // Generate 6 digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Upsert into DB
      const existing = await prisma.companyEmailOTP.findFirst({ where: { email } });
      if (existing) {
        await prisma.companyEmailOTP.update({
          where: { id: existing.id },
          data: { otp: generatedOtp, expiresAt, verified: false }
        });
      } else {
        await prisma.companyEmailOTP.create({
          data: { email, otp: generatedOtp, expiresAt, verified: false }
        });
      }

      // -------------------------------------------------------------
      // ⚠️ IMPORTANT: Log to server console since we don't have an email provider yet
      // -------------------------------------------------------------
      console.log(`\n=================================================`);
      console.log(`[TESTING] OTP for ${email} is: ${generatedOtp}`);
      console.log(`=================================================\n`);
      
      return NextResponse.json({ success: true, message: "OTP sent" });
    }

    if (action === "verify_otp") {
      if (!email || !otp) {
        return NextResponse.json({ success: false, error: "Email and OTP required" }, { status: 400 });
      }

      const record = await prisma.companyEmailOTP.findFirst({
        where: { email, otp }
      });

      if (!record) {
        return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
      }

      if (new Date() > record.expiresAt) {
        return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
      }

      // Mark verified
      await prisma.companyEmailOTP.update({
        where: { id: record.id },
        data: { verified: true }
      });

      return NextResponse.json({ success: true, message: "Email verified successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("verify-company api error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
