"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Star, MapPin, Briefcase, Trash2, Calendar, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedMentor {
  id: string;
  mentorId: string;
  name: string;
  company: string;
  role: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  price: number;
  image: string | null;
}

interface Props {
  initialData: SavedMentor[];
}

export default function SavedMentorsClient({ initialData }: Props) {
  const [mentors, setMentors] = useState<SavedMentor[]>(initialData);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const router = useRouter();

  const handleRemove = async (savedMentorId: string) => {
    setIsRemoving(savedMentorId);
    try {
      const res = await fetch(`/api/saved-mentors/${savedMentorId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMentors(mentors.filter(m => m.id !== savedMentorId));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to remove saved mentor");
    } finally {
      setIsRemoving(null);
    }
  };

  if (mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No saved mentors yet</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          When you find mentors you'd like to work with, save them to your list for easy access.
        </p>
        <Link href="/mentors">
          <Button className="bg-[#FF6B00] hover:bg-[#E66000] text-white">
            Find a Mentor
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Saved Mentors</h1>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {mentors.length} {mentors.length === 1 ? 'Mentor' : 'Mentors'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image 
                    src={mentor.image || "/images/placeholders/user.png"} 
                    alt={mentor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {mentor.rating.toFixed(1)} ({mentor.reviewsCount})
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {mentor.name}
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                  {mentor.role} at <span className="font-medium text-slate-700">{mentor.company}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {mentor.experienceYears} YOE
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  India
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Session Price</p>
                  <p className="text-lg font-bold text-slate-800">
                    {mentor.price === 0 ? "Free" : `₹${mentor.price}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10 rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleRemove(mentor.id)}
                    disabled={isRemoving === mentor.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Link href={`/mentors/${mentor.mentorId}`}>
                    <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
