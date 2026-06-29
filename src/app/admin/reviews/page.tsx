"use client";

import { useState } from "react";
import { ADMIN_REVIEWS } from "@/lib/admin-mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Filter, MoreVertical, Star, MessageSquareOff, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function ReviewsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = ADMIN_REVIEWS.filter(
    (r) =>
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and moderate session feedback.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by text or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Review Info</th>
                  <th className="px-6 py-4 font-medium">Rating & Comment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="font-medium text-foreground">{review.reviewerName}</div>
                      <div className="text-xs text-muted-foreground">to <span className="font-medium">{review.mentorName}</span></div>
                      <div className="text-xs text-muted-foreground mt-2">{review.date}</div>
                      <div className="text-xs text-muted-foreground">Session ID: {review.sessionId}</div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-sm ${review.status === "hidden" ? "italic text-muted-foreground line-through" : "text-foreground"}`}>
                        "{review.comment}"
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-muted hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                          {review.status !== "hidden" ? (
                            <DropdownMenuItem className="text-amber-600">
                              <MessageSquareOff className="w-4 h-4 mr-2" /> Hide Review
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600">Restore Review</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-amber-600">
                            <Flag className="w-4 h-4 mr-2" /> Flag Abuse
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No reviews found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
