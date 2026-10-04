import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.NODE_ENV === "production" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Seed routes disabled in production" }, { status: 403 });
    }

    // Check if subscription already exists
    const existing = await prisma.subscription.findFirst({
      where: { userId: session.user.id }
    });

    if (existing) {
      return NextResponse.json({ message: "Subscription already exists" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 15); // 15 days ago
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: "PRO",
        price: 2900,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        autoRenew: true,
        startDate,
        endDate,
        renewalDate: endDate,
      }
    });

    await prisma.invoice.create({
      data: {
        userId: session.user.id,
        subscriptionId: subscription.id,
        planName: "PRO",
        amount: 2900,
        date: startDate,
        status: "PAID"
      }
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error seeding subscription:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
