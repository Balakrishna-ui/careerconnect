import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, CalendarCheck, DollarSign, Bell } from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "REVIEW" | "BOOKING" | "PAYMENT";
  title: string;
  description: string;
  time: string;
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  return (
    <Card className="shadow-sm border-border h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No recent notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
                <div className="shrink-0 mt-0.5">
                  {notif.type === "REVIEW" && (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  {notif.type === "BOOKING" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                  )}
                  {notif.type === "PAYMENT" && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-none mb-1">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground">{notif.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
