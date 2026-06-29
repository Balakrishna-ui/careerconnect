"use client";

import { ADMIN_NOTIFICATIONS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Send, Clock, Users, Mail, Smartphone, BellRing, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function NotificationsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications Center</h1>
          <p className="text-sm text-muted-foreground">Manage and send platform-wide or targeted notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" /> Campaign History
                </CardTitle>
                <div className="relative w-64">
                  <Input placeholder="Search campaigns..." className="h-8 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-3 font-medium">Campaign</th>
                      <th className="px-6 py-3 font-medium">Audience</th>
                      <th className="px-6 py-3 font-medium">Channels</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ADMIN_NOTIFICATIONS.map((notification) => (
                      <tr key={notification.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground mb-1">{notification.title}</div>
                          <div className="text-xs text-muted-foreground max-w-sm truncate">{notification.message}</div>
                          <div className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">{notification.type.replace("_", " ")}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1 text-sm capitalize">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" /> {notification.audience.replace("_", " ")}
                          </div>
                          {notification.recipients > 0 && (
                            <div className="text-xs text-muted-foreground">{notification.recipients.toLocaleString()} recipients</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1.5">
                            {notification.channels.includes("email") && <Badge variant="secondary" className="px-1.5"><Mail className="w-3 h-3" /></Badge>}
                            {notification.channels.includes("sms") && <Badge variant="secondary" className="px-1.5"><Smartphone className="w-3 h-3" /></Badge>}
                            {notification.channels.includes("push") && <Badge variant="secondary" className="px-1.5"><BellRing className="w-3 h-3" /></Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={notification.status} className="mb-1 block w-max" />
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {notification.sentAt}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Send</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Title</label>
                  <Input placeholder="E.g., Scheduled Maintenance" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Audience</label>
                  <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="all">All Users</option>
                    <option value="mentors">Mentors Only</option>
                    <option value="job_seekers">Job Seekers Only</option>
                  </select>
                </div>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Send Now
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
