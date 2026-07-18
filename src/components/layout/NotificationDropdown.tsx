"use client";

import { useState } from "react";
import useSWR from "swr";
import { Bell, Check, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
};

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications, mutate } = useSWR<Notification[]>("/api/notifications", fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const markAsRead = async (id: string, actionUrl?: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    
    mutate(); // Refresh the list
    setIsOpen(false);
    
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="relative rounded-full" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="p-0 font-semibold text-base">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn("flex flex-col items-start p-3 cursor-pointer gap-1 border-b last:border-b-0", !notification.isRead && "bg-muted/50")}
                onClick={() => markAsRead(notification.id, notification.actionUrl)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className={cn("text-sm leading-tight", !notification.isRead && "font-semibold")}>
                    {notification.message}
                  </span>
                  {!notification.isRead && (
                    <span className="h-2 w-2 mt-1 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
        {notifications && notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="w-full cursor-pointer justify-center text-center font-medium text-primary"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
