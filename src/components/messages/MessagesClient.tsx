"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserConversations, getMessages, sendMessage, markAsRead } from "@/actions/message-actions";
import { getPusherClient } from "@/lib/pusher-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface MessagesClientProps {
  currentUserId: string;
}

export function MessagesClient({ currentUserId }: MessagesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get("conversationId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async (autoSelectId?: string) => {
    try {
      const data = await getUserConversations();
      setConversations(data);
      if (autoSelectId) {
        const found = data.find((c: any) => c.id === autoSelectId);
        if (found) selectConversation(found);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchConversations(initialConversationId || undefined);
    
    // Subscribe to global user events (for updating unread counts and conversation list)
    const pusher = getPusherClient();
    const userChannelName = `user-${currentUserId}`;
    const userChannel = pusher.subscribe(userChannelName);
    
    userChannel.bind("conversations-updated", () => {
      fetchConversations();
    });

    return () => {
      pusher.unsubscribe(userChannelName);
    };
  }, []);

  const selectConversation = async (conv: any) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    setMessages([]);
    
    try {
      const data = await getMessages(conv.id);
      setMessages(data);
      
      // Mark as read
      if (conv.unreadCount > 0) {
        await markAsRead(conv.id);
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
      }
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Subscribe to selected conversation messages
  useEffect(() => {
    if (!selectedConv) return;
    
    const pusher = getPusherClient();
    const channelName = `conversation-${selectedConv.id}`;
    const channel = pusher.subscribe(channelName);
    
    channel.bind("new-message", async (newMsg: any) => {
      setMessages(prev => {
        // Prevent duplicate append
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(scrollToBottom, 100);
      
      // If it's not our message, mark as read immediately since we are viewing it
      if (newMsg.senderId !== currentUserId) {
        await markAsRead(selectedConv.id);
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [selectedConv]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConv) return;
    
    const msgText = inputText;
    setInputText("");
    setSendingMessage(true);
    
    try {
      const sentMsg = await sendMessage(selectedConv.id, msgText);
      // We rely on pusher to append it, but we can optimistically append:
      setMessages(prev => {
        if (prev.find(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setTimeout(scrollToBottom, 100);
      
      // Update local conversation list order
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== selectedConv.id);
        const updatedConv = {
          ...selectedConv,
          lastMessage: { content: msgText, createdAt: new Date(), senderId: currentUserId }
        };
        return [updatedConv, ...filtered];
      });

    } catch (err) {
      toast.error("Message couldn't be sent. Please try again.");
      setInputText(msgText); // Restore input on failure
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900/50">
      
      {/* Sidebar List - Hidden on mobile if a conversation is selected */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input className="pl-9 bg-slate-50 dark:bg-slate-800 border-none" placeholder="Search conversations..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex justify-center items-center h-20 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              <p className="mb-4">No conversations yet</p>
              <p className="mb-4">Start a conversation with a mentor to get career guidance.</p>
              <Button onClick={() => router.push("/mentors")} variant="outline" size="sm">
                Find a Mentor
              </Button>
            </div>
          ) : (
            conversations.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => selectConversation(chat)}
                className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer flex gap-3 transition-colors ${selectedConv?.id === chat.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.otherUser.image || ""} />
                    <AvatarFallback>{chat.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {/* Mock Online status, could integrate with presence channel later */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate">{chat.otherUser.name}</h3>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-500'}`}>
                    {chat.lastMessage ? (chat.lastMessage.senderId === currentUserId ? `You: ${chat.lastMessage.content}` : chat.lastMessage.content) : "Start the conversation"}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[10px] flex items-center justify-center font-bold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Your Messages</h3>
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => setSelectedConv(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConv.otherUser.image || ""} />
                  <AvatarFallback>{selectedConv.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold flex items-center gap-1">
                    {selectedConv.otherUser.name}
                    {selectedConv.otherUser.role.toLowerCase() !== "job seeker" && (
                      <span className="text-emerald-500 text-[10px] ml-1 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-sm font-semibold">PRO</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedConv.otherUser.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-slate-400"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hidden sm:inline-flex"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-sm text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={selectedConv.otherUser.image || ""} />
                      <AvatarFallback>{selectedConv.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Start the conversation</h3>
                    <p className="text-sm text-slate-500">Introduce yourself and let {selectedConv.otherUser.name.split(' ')[0]} know what you'd like help with.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId;
                  const showTime = index === messages.length - 1 || 
                    new Date(messages[index + 1].createdAt).getTime() - new Date(msg.createdAt).getTime() > 10 * 60 * 1000;
                  
                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 shrink-0 hidden sm:block">
                        <AvatarFallback>{isMe ? "ME" : selectedConv.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-[#FF6B00] text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                        {showTime && (
                          <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? 'mr-1' : 'ml-1'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 shrink-0 hidden sm:flex"><Paperclip className="w-5 h-5" /></Button>
                <div className="flex-1 relative">
                  <Input 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pr-10 focus-visible:ring-[#FF6B00]" 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendingMessage}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 text-slate-400 h-8 w-8"><Smile className="w-4 h-4" /></Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || sendingMessage}
                  className="bg-[#FF6B00] hover:bg-[#e66000] rounded-full shrink-0 h-10 w-10 p-0 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
                >
                  {sendingMessage ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white ml-0.5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Just for the empty state icon
function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
