"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Plus, CheckCircle2, Circle, Clock, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: string;
  completed: boolean;
};

export default function TasksClient() {
  const { data, error, isLoading, mutate } = useSWR<Task[]>("/api/tasks", fetcher);
  
  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const tasks = data || [];
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage your goals and assignments.</p>
        </div>
        <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Pending Tasks ({pending.length})</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No pending tasks. You're all caught up!</div>
            ) : (
              pending.map(task => (
                <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <button className="mt-1 text-slate-300 hover:text-[#FF6B00]">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                    {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> {format(new Date(task.deadline), "MMM dd")}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {completed.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden opacity-75">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300">Completed ({completed.length})</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {completed.map(task => (
                <div key={task.id} className="p-4 flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 mt-1 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-500 line-through">{task.title}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
