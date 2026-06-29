import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/_/g, " ");
  
  let variantClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  
  // Success / Positive
  if (["active", "verified", "completed", "success", "resolved", "visible", "cleared", "low"].includes(status.toLowerCase())) {
    variantClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
  }
  // Warning / Pending
  else if (["pending", "under_review", "scheduled", "in_progress", "medium"].includes(status.toLowerCase())) {
    variantClass = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
  }
  // Error / Negative
  else if (["banned", "rejected", "cancelled", "no_show", "failed", "high", "critical", "flagged"].includes(status.toLowerCase())) {
    variantClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
  }
  // Neutral / Info
  else if (["suspended", "refunded", "investigating", "open"].includes(status.toLowerCase())) {
    variantClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium capitalize px-2 py-0.5 whitespace-nowrap", variantClass, className)}
    >
      {normalizedStatus}
    </Badge>
  );
}
