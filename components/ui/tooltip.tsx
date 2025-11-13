"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  children,
  text,
  className = ""
}: {
  children: React.ReactNode;
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center group", className)}>
      {children}
      <div className="
        absolute left-1/2 -translate-x-1/2 top-full mt-1
        hidden group-hover:block
        whitespace-nowrap
        bg-slate-900 text-white text-xs px-2 py-1 rounded-md shadow-lg
        z-50
      ">
        {text}
      </div>
    </div>
  );
}
