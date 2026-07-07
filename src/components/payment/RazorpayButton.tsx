"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RazorpayButtonProps {
  amount: number;
  type: "PREMIUM_UNLOCK" | "BOOKING";
  metadata?: any;
  buttonText: string;
  className?: string;
  onSuccess?: () => void;
}

export function RazorpayButton({ amount, type, metadata, buttonText, className, onSuccess }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { data: session, update } = useSession();
  const router = useRouter();

  const handlePayment = async () => {
    if (!session) {
      router.push("/signup?view=login");
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay Script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // Create Order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) throw new Error(orderData.error);

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CareerConnect",
        description: type === "PREMIUM_UNLOCK" ? "Premium Access Unlock" : "Session Booking",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify Payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type,
                metadata
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              if (type === "PREMIUM_UNLOCK") {
                await update({ premium: true });
              }
              if (onSuccess) onSuccess();
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
      {buttonText}
    </Button>
  );
}

// Utility to load script dynamically
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
