import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAYE Demo",
  description: "Participant portal demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
