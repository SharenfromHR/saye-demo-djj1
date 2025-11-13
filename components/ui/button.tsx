"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 " +
  "bg-slate-900 text-white hover:bg-slate-800";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(buttonVariants, className)}
      {...props}
    />
  );
}
