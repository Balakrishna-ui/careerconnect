"use client";

import React from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { FileText, Download, Trash2, UploadCloud, File, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Document = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  size?: number;
  createdAt: string;
};

export default function DocumentsClient() {
  const { data: documents, isLoading } = useSWR<Document[]>("/api/documents", fetcher);
  
  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const docs = documents || [];

  const getIcon = (type: string) => {
    switch(type) {
      case "RESUME": return <FileText className="w-8 h-8 text-blue-500" />;
      case "PORTFOLIO": return <ImageIcon className="w-8 h-8 text-purple-500" />;
      default: return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">Manage your uploaded files and resumes.</p>
        </div>
        <Button className="bg-[#FF6B00] hover:bg-[#e66000] text-white">
          <UploadCloud className="w-4 h-4 mr-2" /> Upload File
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload your resume or cover letter to share with mentors during bookings.</p>
            <Button variant="outline">Browse Files</Button>
          </div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  {getIcon(doc.type)}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.title}</h3>
              <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                <span>{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}</span>
                <span>{format(new Date(doc.createdAt), "MMM dd, yyyy")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
