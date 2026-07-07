"use client";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
    >
      Print / Save as PDF
    </button>
  );
}
