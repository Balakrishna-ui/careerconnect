"use client";

import { useState } from "react";
import { SUPPORT_TICKETS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MessageSquare, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SupportTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(SUPPORT_TICKETS[0]?.id || null);

  const filteredTickets = SUPPORT_TICKETS.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTicket = SUPPORT_TICKETS.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
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
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <Badge variant="secondary" className="cursor-pointer">All</Badge>
              <Badge variant="outline" className="cursor-pointer text-amber-600 border-amber-200">Open</Badge>
              <Badge variant="outline" className="cursor-pointer text-blue-600 border-blue-200">In Progress</Badge>
              <Badge variant="outline" className="cursor-pointer text-emerald-600 border-emerald-200">Resolved</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="divide-y">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedTicketId === ticket.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{ticket.id}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.updatedAt}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> {ticket.userName}
                    </div>
                    <StatusBadge status={ticket.status} className="text-[10px] px-1.5 py-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Detail (Chat View) */}
        <Card className="flex flex-col col-span-2 overflow-hidden h-full">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-muted/20 flex justify-between items-start flex-shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                    <StatusBadge status={selectedTicket.priority} className={selectedTicket.priority === 'critical' ? 'bg-red-100 text-red-800' : ''} />
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4">
                    <span>From: <strong className="text-foreground">{selectedTicket.userName}</strong> ({selectedTicket.userType})</span>
                    <span>Assigned To: <strong className="text-foreground">{selectedTicket.assignedTo}</strong></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Assign to Me</Button>
                  <Button size="sm" variant={selectedTicket.status === 'resolved' ? 'outline' : 'default'} className={selectedTicket.status === 'resolved' ? 'text-emerald-600' : ''}>
                    {selectedTicket.status === 'resolved' ? 'Reopen Ticket' : 'Mark Resolved'}
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender.includes("Admin");
                  return (
                    <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{msg.sender}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-lg max-w-[80%] text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border dark:bg-gray-800 rounded-tl-none shadow-sm'}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t bg-background flex-shrink-0">
                <div className="relative">
                  <textarea 
                    className="w-full min-h-[80px] p-3 pr-12 rounded-lg border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="Type your reply here..."
                  />
                  <Button size="icon" className="absolute bottom-3 right-3 rounded-full h-8 w-8">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a ticket to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
