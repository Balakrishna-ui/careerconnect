"use client";

import { ADMIN_MENTORS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, GripVertical, Star, ArrowUp, ArrowDown, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function FeaturedMentors() {
  const featuredMentors = ADMIN_MENTORS.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Featured Mentors</h1>
          <p className="text-sm text-muted-foreground">Manage the mentors highlighted on the homepage.</p>
        </div>
        <Button size="sm">
          <Zap className="w-4 h-4 mr-2" /> Feature New Mentor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {featuredMentors.map((mentor, index) => (
            <Card key={mentor.id} className="relative group overflow-hidden border-2 hover:border-blue-500/50 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/50 border-r flex items-center justify-center cursor-move group-hover:bg-blue-50 transition-colors">
                <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
              </div>
              <CardContent className="p-4 pl-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg text-muted-foreground w-6 text-center">#{index + 1}</div>
                  <img src={mentor.image} alt={mentor.name} className="w-12 h-12 rounded-full object-cover border shadow-sm" />
                  <div>
                    <div className="font-medium">{mentor.name}</div>
                    <div className="text-xs text-muted-foreground">{mentor.designation} @ {mentor.company}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Until Dec 31
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-8 p-0" disabled={index === 0}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-8 p-0" disabled={index === featuredMentors.length - 1}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Featured Profiles</label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={6} className="w-20" />
                  <span className="text-sm text-muted-foreground">profiles</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-Rotate</label>
                <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="none">Disabled (Manual Order)</option>
                  <option value="daily">Daily Rotation</option>
                  <option value="weekly">Weekly Rotation</option>
                </select>
              </div>
              <Button className="w-full">Save Configuration</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Homepage Carousel Preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
