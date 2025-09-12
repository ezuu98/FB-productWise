import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FB ProductWise",
  description: "Next.js app with App Router, TypeScript, and Tailwind CSS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
