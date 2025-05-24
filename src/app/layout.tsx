import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "./UserProvider";

export const metadata: Metadata = {
  title: "BiteBill | Effortless Bill Splitting",
  description: "Split food bills with your team easily, fairly, and fast.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}