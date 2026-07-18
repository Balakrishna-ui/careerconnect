import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "INR", receipt = "receipt" } = body;

    let finalAmount = amount;

    // If it's a booking, check if user is premium and apply discount
    if (session.user.premium) {
      // 10% discount for premium users, or waive a flat platform fee.
      // Let's do a 10% discount for now.
      finalAmount = Math.max(0, amount * 0.9);
    }

    const options = {
      amount: Math.round(finalAmount * 100), // Razorpay expects amount in smallest currency unit (paise)
      currency,
      receipt: `${receipt}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order", details: error.message },
      { status: 500 }
    );
  }
}
