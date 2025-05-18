import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BiteBill | Effortless Bill Splitting",
  description: "Split food bills with your team easily, fairly, and fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background antialiased">
        {children}
      </body>
    </html>
  );
}