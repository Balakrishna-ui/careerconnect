"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface SuspendConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  mentorName: string;
}

export function SuspendConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  mentorName
}: SuspendConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend Account?</DialogTitle>
          <DialogDescription>
            Are you sure you want to suspend <strong>{mentorName}</strong>'s account? The mentor will no longer be able to access their account or receive new bookings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={onClose}>Cancel</Button>
          <Button 
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onConfirm(); }}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Suspend Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  mentorName: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  mentorName
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete User Permanently?</DialogTitle>
          <DialogDescription>
            This action permanently deletes <strong>{mentorName}</strong>'s account and cannot be undone. All associated profile data will be removed or anonymized according to the platform's data-retention rules.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={onClose}>Cancel</Button>
          <Button 
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onConfirm(); }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
