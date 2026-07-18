"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Clock, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
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

export default function NotificationsPage() {
  const { data: notifications, mutate, isLoading } = useSWR<Notification[]>("/api/notifications", fetcher, { refreshInterval: 5000 });

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    mutate();
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    mutate();
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage your alerts and activities.</p>
        </div>
        {notifications && notifications.some(n => !n.isRead) && (
          <Button onClick={markAllAsRead} variant="outline" className="shrink-0 gap-2">
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex p-4 gap-4 items-start">
                  <Skeleton className="h-2 w-2 mt-2 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No notifications yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                When you receive bookings, messages, or updates, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications?.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors hover:bg-muted/30",
                    !notification.isRead && "bg-muted/10"
                  )}
                >
                  <div className="flex gap-4 items-start flex-1">
                    {!notification.isRead ? (
                      <span className="h-2.5 w-2.5 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    ) : (
                      <span className="h-2.5 w-2.5 mt-1.5 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className={cn("text-sm sm:text-base leading-tight", !notification.isRead ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        <span className="px-1.5 py-0.5 rounded-full bg-muted border text-[10px] uppercase font-medium">
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6 sm:ml-0 self-end sm:self-auto shrink-0">
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 px-2 text-xs"
                      >
                        Mark read
                      </Button>
                    )}
                    {notification.actionUrl && (
                      <Link href={notification.actionUrl} onClick={() => !notification.isRead && markAsRead(notification.id)} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8 gap-1.5")}>
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
