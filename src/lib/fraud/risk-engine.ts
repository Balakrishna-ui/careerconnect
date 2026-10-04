import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export const RISK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 50,
  HIGH: 80,
  CRITICAL: 100,
};

export type SecurityEventType = 
  | "FAILED_LOGIN"
  | "VPN_DETECTED"
  | "TEMP_EMAIL"
  | "RAPID_BOOKING"
  | "FAKE_REVIEW"
  | "MULTIPLE_ACCOUNTS"
  | "PAYMENT_FAILED"
  | "CHARGEBACK";

export const RISK_IMPACT: Record<SecurityEventType, number> = {
  FAILED_LOGIN: 10,
  VPN_DETECTED: 15,
  TEMP_EMAIL: 20,
  RAPID_BOOKING: 20,
  FAKE_REVIEW: 25,
  MULTIPLE_ACCOUNTS: 30,
  PAYMENT_FAILED: 10,
  CHARGEBACK: 50,
};

function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "EXTREME" {
  if (score <= 20) return "LOW";
  if (score <= 50) return "MEDIUM";
  if (score <= 80) return "HIGH";
  if (score <= 100) return "CRITICAL";
  return "EXTREME";
}

/**
 * Logs a security event, updates the user's risk score, and evaluates automated actions.
 */
export async function logSecurityEvent(
  userId: string, 
  eventType: SecurityEventType, 
  description: string, 
  metadata?: any
) {
  const impact = RISK_IMPACT[eventType];

  if (!impact) {
    console.error(`Invalid security event type: ${eventType}`);
    return;
  }

  try {
    // 1. Log the event
    const event = await prisma.securityEvent.create({
      data: {
        userId,
        eventType,
        riskImpact: impact,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // 2. Calculate the new score (Could also sum events over the last 30 days)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { riskScore: true, fraudStatus: true, email: true, name: true },
    });

    if (!user) return;

    const newScore = Math.min(user.riskScore + impact, 150); // Cap at 150
    const newLevel = getRiskLevel(newScore);

    // Evaluate automated actions
    let newFraudStatus = user.fraudStatus;
    
    if (newLevel === "CRITICAL" || newLevel === "EXTREME") {
      if (newFraudStatus !== "BANNED") {
        newFraudStatus = "SUSPENDED";
      }
    } else if (newLevel === "HIGH" && newFraudStatus === "CLEARED") {
      newFraudStatus = "INVESTIGATING";
    }

    // 3. Update the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        riskScore: newScore,
        riskLevel: newLevel,
        fraudStatus: newFraudStatus,
      },
    });

    // 4. Trigger notifications for MEDIUM+ risks
    if ((newLevel === "MEDIUM" || newLevel === "HIGH") && user.email) {
      await sendNotificationEmail(
        user.email,
        user.name || "User",
        "Security Alert",
        `We detected unusual activity on your account: ${description}. If this was you, you can ignore this message. Otherwise, please change your password immediately.`,
        "/dashboard/settings"
      ).catch(err => console.error("Failed to send fraud warning email:", err));
    }

    return { success: true, event, newScore, newLevel };
  } catch (err) {
    console.error("Failed to log security event:", err);
    return { success: false, error: "Database error" };
  }
}

/**
 * Analyzes login patterns from a specific IP to detect credential stuffing or brute force attacks.
 */
export async function analyzeLoginAnomaly(ip: string) {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return;

  try {
    const recentFailures = await prisma.loginHistory.count({
      where: {
        ipAddress: ip,
        status: "FAILED",
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      }
    });

    if (recentFailures > 20) {
      console.warn(`[SECURITY ALERT] Credential stuffing detected from IP: ${ip}. ${recentFailures} failures in 15 mins.`);
      // In a full production system, we would insert this IP into a WAF blocklist or a blockedIPs table.
      
      // For now, we will log a global security event targeted at the system (using a system user id if applicable, 
      // or just logging it). Since our events require a userId, we'll skip DB logging for anonymous IPs 
      // but the console.warn will trigger our infrastructure monitoring.
    }
  } catch (err) {
    console.error("Error analyzing login anomaly:", err);
  }
}
