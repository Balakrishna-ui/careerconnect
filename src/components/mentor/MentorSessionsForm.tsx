"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MentorSessionsForm() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newPrice, setNewPrice] = useState("0");

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/mentor/sessions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessionTypes || []);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, duration: Number(newDuration), price: Number(newPrice) }),
      });
      
      if (res.ok) {
        setNewTitle("");
        setNewDuration("30");
        setNewPrice("0");
        await fetchSessions();
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to add session");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    const previousSessions = [...sessions];
    setSessions(sessions.filter(s => s.id !== id));
    
    try {
      const res = await fetch(`/api/mentor/sessions?id=${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        setSessions(previousSessions);
        // Only log error if not a 404 (in case it was already deleted)
        if (res.status !== 404) {
          console.error("Failed to delete session");
        }
      } else {
        router.refresh();
      }
    } catch (err) {
      setSessions(previousSessions);
      console.error("Failed to delete session", err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Session Offerings</CardTitle>
          <CardDescription>Manage the types of sessions you offer to mentees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't added any session types yet.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <h4 className="font-semibold">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">{session.duration} Minutes</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold">₹{session.price}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-muted/30">
        <CardHeader>
          <CardTitle>Add New Session Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSession} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title (e.g. Resume Review)</Label>
              <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input id="duration" type="number" min={15} step={15} value={newDuration} onChange={(e) => setNewDuration(e.target.value.replace(/^0+(?=\d)/, ''))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" min={0} value={newPrice} onChange={(e) => setNewPrice(e.target.value.replace(/^0+(?=\d)/, ''))} required />
            </div>
            <Button type="submit" disabled={isSaving || !newTitle} className="w-full mt-4 md:mt-0 md:col-span-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
