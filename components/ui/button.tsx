"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary";
}

export function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default:
      "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
    outline:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100",
    secondary:
      "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200",
  };

  return (
    <button
      {...props}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}
