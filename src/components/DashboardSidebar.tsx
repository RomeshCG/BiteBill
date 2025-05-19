"use client";
import React from "react";
import { FaUsers, FaHistory, FaCog, FaHome } from "react-icons/fa";
import Link from "next/link";

export default function DashboardSidebar({ userName }: { userName: string }) {
  return (
    <aside className="bg-[#10182A] text-white w-full sm:w-64 flex-shrink-0 py-6 px-4 flex flex-col min-h-screen">
      <div className="mb-8">
        <span className="text-xl font-bold text-[#4fd1c5]">BiteBill</span>
        <div className="mt-4 font-semibold">{userName}</div>
      </div>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#17223b] font-medium">
          <FaHome /> Dashboard
        </Link>
        <Link href="/teams" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#17223b]">
          <FaUsers /> Teams
        </Link>
        <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#17223b]">
          <FaHistory /> History
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#17223b]">
          <FaCog /> Settings
        </Link>
      </nav>
    </aside>
  );
}