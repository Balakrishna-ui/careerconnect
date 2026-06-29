import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  className?: string;
  valuePrefix?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last month",
  className,
  valuePrefix = "",
}: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">
            {valuePrefix}
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend !== undefined && (
            <div className="flex items-center text-xs">
              {trend > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              ) : trend < 0 ? (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <Minus className="mr-1 h-3 w-3 text-gray-500" />
              )}
              <span
                className={cn(
                  "font-medium",
                  trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "text-gray-500"
                )}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
              <span className="text-muted-foreground ml-1">{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
