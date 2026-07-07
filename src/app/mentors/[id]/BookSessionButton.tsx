"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";

export default function BookSessionButton({
  mentorId,
  serviceId,
  isAuthenticated,
}: {
  mentorId: string;
  serviceId?: string;
  isAuthenticated: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bookUrl = serviceId 
    ? `/mentors/${mentorId}/book?service=${serviceId}`
    : `/mentors/${mentorId}/book`;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Stop the link from navigating
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Link
        href={bookUrl}
        onClick={handleClick}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full h-12 text-sm font-semibold shadow-md"
        )}
      >
        Book Session
      </Link>

      <LoginRequiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        callbackUrl={bookUrl}
      />
    </>
  );
}
