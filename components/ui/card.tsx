"use client";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white shadow-sm ring-1 ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props} />
  );
}
