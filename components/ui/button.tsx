"use client";

export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className={(props.className || "") + " border px-3 py-1 rounded-md"}
    >
      {children}
    </button>
  );
}
