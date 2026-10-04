"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, MessageSquare, Clock, User, CheckCircle2, AlertCircle, Paperclip, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getTicketDetails, replyToTicket, updateTicketStatus, updateTicketPriority, assignTicket } from "@/actions/support-actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SupportTicketsClient({ 
  initialData, 
  admins,
  searchParams: initialParams
}: { 
  initialData: any; 
  admins: any[];
  searchParams: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialParams.search || "");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialParams.ticketId || null);
  const [selectedTicketData, setSelectedTicketData] = useState<any>(null);
  
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  const { tickets, totalPages, totalCount, analytics } = initialData;
  const currentStatus = searchParams.get("status") || "ALL";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSort = searchParams.get("sort") || "newest";

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams({ search: searchTerm, page: "1" });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle URL Param Updates
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Load ticket details when selectedTicketId changes
  useEffect(() => {
    if (selectedTicketId) {
      updateUrlParams({ ticketId: selectedTicketId });
      loadTicketDetails(selectedTicketId);
    } else {
      setSelectedTicketData(null);
    }
  }, [selectedTicketId]);

  const loadTicketDetails = async (id: string) => {
    setIsLoadingTicket(true);
    try {
      const data = await getTicketDetails(id);
      setSelectedTicketData(data);
    } catch (error) {
      toast.error("Failed to load ticket details");
    } finally {
      setIsLoadingTicket(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicketId) return;
    setIsReplying(true);
    try {
      await replyToTicket(selectedTicketId, replyMessage);
      toast.success("Reply sent!");
      setReplyMessage("");
      loadTicketDetails(selectedTicketId); // Reload to show new message
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicketId) return;
    try {
      await updateTicketStatus(selectedTicketId, status);
      toast.success(`Status updated to ${status}`);
      loadTicketDetails(selectedTicketId);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!selectedTicketId) return;
    try {
      await updateTicketPriority(selectedTicketId, priority);
      toast.success(`Priority updated to ${priority}`);
      loadTicketDetails(selectedTicketId);
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const handleAssign = async (adminId: string) => {
    if (!selectedTicketId) return;
    try {
      await assignTicket(selectedTicketId, adminId === "unassigned" ? null : adminId);
      toast.success("Assignment updated");
      loadTicketDetails(selectedTicketId);
    } catch (error) {
      toast.error("Failed to update assignment");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "HIGH": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "MEDIUM": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "LOW": return "text-gray-600 bg-gray-100 dark:bg-gray-800";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Analytics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-4 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-950/20">
          <span className="text-sm text-muted-foreground font-medium">Open Tickets</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.open}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-amber-50/50 dark:bg-amber-950/20">
          <span className="text-sm text-muted-foreground font-medium">In Progress</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.inProgress}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-950/20">
          <span className="text-sm text-muted-foreground font-medium">Resolved Today</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.resolvedToday}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-red-50/50 dark:bg-red-950/20">
          <span className="text-sm text-muted-foreground font-medium">Critical</span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.critical}</span>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and resolve user issues and inquiries.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Ticket List */}
        <Card className="flex flex-col overflow-hidden col-span-1 border-r">
          <CardHeader className="p-4 border-b flex-shrink-0">
            <div className="relative w-full mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
              <Badge 
                variant={currentStatus === "ALL" ? "default" : "secondary"} 
                className="cursor-pointer"
                onClick={() => updateUrlParams({ status: "ALL", page: "1" })}
              >All</Badge>
              <Badge 
                variant={currentStatus === "OPEN" ? "default" : "outline"} 
                className={`cursor-pointer ${currentStatus !== "OPEN" ? "text-amber-600 border-amber-200" : "bg-amber-600"}`}
                onClick={() => updateUrlParams({ status: "OPEN", page: "1" })}
              >Open</Badge>
              <Badge 
                variant={currentStatus === "IN_PROGRESS" ? "default" : "outline"} 
                className={`cursor-pointer ${currentStatus !== "IN_PROGRESS" ? "text-blue-600 border-blue-200" : "bg-blue-600"}`}
                onClick={() => updateUrlParams({ status: "IN_PROGRESS", page: "1" })}
              >In Progress</Badge>
              <Badge 
                variant={currentStatus === "RESOLVED" ? "default" : "outline"} 
                className={`cursor-pointer ${currentStatus !== "RESOLVED" ? "text-emerald-600 border-emerald-200" : "bg-emerald-600"}`}
                onClick={() => updateUrlParams({ status: "RESOLVED", page: "1" })}
              >Resolved</Badge>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{totalCount} Tickets</span>
              <Select value={currentSort} onValueChange={(v) => updateUrlParams({ sort: v, page: "1" })}>
                <SelectTrigger className="h-7 w-[120px] text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 relative">
            {isPending && <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">Loading...</div>}
            <div className="divide-y">
              {tickets.map((ticket: any) => (
                <div 
                  key={ticket.id} 
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedTicketId === ticket.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">#{ticket.id.slice(-8).toUpperCase()}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{ticket.category}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> {ticket.user.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={ticket.status.toLowerCase()} className="text-[10px] px-1.5 py-0" />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                  <p>No support tickets yet.</p>
                  {currentStatus !== "ALL" && <p className="text-xs mt-1">Try changing the filter.</p>}
                </div>
              )}
            </div>
          </CardContent>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t flex justify-between items-center bg-muted/20 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => updateUrlParams({ page: (currentPage - 1).toString() })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => updateUrlParams({ page: (currentPage + 1).toString() })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>

        {/* Ticket Detail */}
        <Card className="flex flex-col col-span-2 overflow-hidden h-full">
          {isLoadingTicket ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Loading ticket details...
            </div>
          ) : selectedTicketData ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-muted/20 flex justify-between items-start flex-shrink-0">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-bold text-lg">{selectedTicketData.category}</h2>
                    <StatusBadge status={selectedTicketData.status.toLowerCase()} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mt-3">
                    <div>User: <strong className="text-foreground">{selectedTicketData.user.name}</strong></div>
                    <div>Mentor: <strong className="text-foreground">{selectedTicketData.mentor.name}</strong></div>
                    <div>Booking ID: <strong className="font-mono text-foreground">#{selectedTicketData.bookingId.slice(-8).toUpperCase()}</strong></div>
                    <div>Created: <strong className="text-foreground">{format(new Date(selectedTicketData.createdAt), 'MMM d, yyyy h:mm a')}</strong></div>
                  </div>
                </div>
                
                {/* Admin Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Select value={selectedTicketData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTicketData.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTicketData.assignedToId || "unassigned"} onValueChange={handleAssign}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Assign To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {admins.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Chat Messages / Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900/50">
                {/* Initial Description */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 ml-2">
                    <span className="text-xs font-semibold text-foreground">{selectedTicketData.user.name}</span>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(selectedTicketData.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <div className="p-4 rounded-xl text-sm bg-white border dark:bg-gray-800 rounded-tl-none shadow-sm whitespace-pre-wrap w-full max-w-[85%] leading-relaxed">
                    {selectedTicketData.description}
                  </div>
                  {selectedTicketData.attachment && (
                    <div className="mt-2 ml-2 flex items-center gap-2 text-sm text-blue-600">
                      <Paperclip className="w-4 h-4" />
                      <a href={selectedTicketData.attachment} target="_blank" rel="noreferrer" className="hover:underline">View Attachment</a>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {selectedTicketData.messages?.map((msg: any) => {
                  const isAdmin = msg.senderRole === "ADMIN";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isAdmin ? "mr-2 flex-row-reverse" : "ml-2"}`}>
                        <span className="text-xs font-semibold text-foreground">{msg.sender.name}</span>
                        {isAdmin && <Badge variant="secondary" className="text-[8px] h-4 px-1">Admin</Badge>}
                        <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <div className={`p-4 rounded-xl text-sm shadow-sm whitespace-pre-wrap w-full max-w-[85%] leading-relaxed ${
                        isAdmin 
                          ? "bg-blue-600 text-white rounded-tr-none border border-blue-700" 
                          : "bg-white border dark:bg-gray-800 rounded-tl-none"
                      }`}>
                        {msg.message}
                      </div>
                      {msg.attachmentUrl && (
                        <div className={`mt-2 flex items-center gap-2 text-sm ${isAdmin ? "mr-2 text-blue-600" : "ml-2 text-blue-600"}`}>
                          <Paperclip className="w-4 h-4" />
                          <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="hover:underline">View Attachment</a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t bg-background flex-shrink-0">
                <div className="relative">
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full min-h-[100px] p-3 pr-12 rounded-lg border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="Write your reply here... (Markdown supported)"
                    disabled={isReplying || selectedTicketData.status === "CLOSED"}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground" 
                      disabled={isReplying || selectedTicketData.status === "CLOSED"}
                      onClick={() => toast.info("File attachments are disabled in this demo.")}
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="rounded-full h-8 w-8" 
                      disabled={isReplying || selectedTicketData.status === "CLOSED" || !replyMessage.trim()}
                      onClick={handleReply}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a ticket to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
