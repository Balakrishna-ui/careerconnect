/**
 * Platform Commission & Split Calculator
 * 
 * Provides deterministic and auditable calculations for gross booking amounts,
 * platform service fees, and mentor net earnings.
 */

export interface FinancialSplit {
  grossAmount: number;
  platformFee: number;
  mentorEarnings: number;
  currency: string;
}

/**
 * Calculates platform commission and mentor net earnings.
 * Uses integer math to avoid floating point inaccuracies.
 * 
 * Default commission rate is configurable via PLATFORM_COMMISSION_PERCENT.
 * If not set in environment, defaults to 10% (0.10).
 */
export function calculateCommission(
  grossAmount: number,
  currency = "INR",
  customRatePercent?: number
): FinancialSplit {
  if (grossAmount <= 0) {
    return {
      grossAmount: 0,
      platformFee: 0,
      mentorEarnings: 0,
      currency,
    };
  }

  // Get commission percentage from environment or parameter, default to 10%
  const defaultRate = process.env.PLATFORM_COMMISSION_PERCENT
    ? parseFloat(process.env.PLATFORM_COMMISSION_PERCENT)
    : 10;

  const rate = customRatePercent !== undefined ? customRatePercent : defaultRate;

  // Ensure rate is between 0% and 100%
  const validRate = Math.max(0, Math.min(100, rate));

  // Platform fee in integer currency units
  const platformFee = Math.round((grossAmount * validRate) / 100);
  const mentorEarnings = Math.max(0, grossAmount - platformFee);

  return {
    grossAmount,
    platformFee,
    mentorEarnings,
    currency,
  };
}
