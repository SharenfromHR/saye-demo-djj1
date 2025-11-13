"use client";

export function Card({ children, className='' }) {
  return <div className={"border rounded-xl bg-white "+className}>{children}</div>;
}
export function CardContent({ children, className='' }) {
  return <div className={className}>{children}</div>;
}
