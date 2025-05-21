"use client";
import React from "react";
import { FaUsers, FaHistory, FaCog, FaHome, FaReceipt } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className="bg-[#10182A] text-white w-full sm:w-64 flex-shrink-0 py-6 px-4 flex flex-col min-h-screen">
      <div className="mb-8">
        <span className="text-xl font-bold text-[#4fd1c5]">BiteBill</span>
        <div className="mt-4 font-semibold">{userName}</div>
      </div>
      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            pathname === "/dashboard"
              ? "bg-[#17223b]"
              : "hover:bg-[#17223b]"
          }`}
        >
          <FaHome /> Dashboard
        </Link>
        <Link
          href="/your-bills"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            pathname === "/your-bills" ? "bg-[#17223b]" : "hover:bg-[#17223b]"
          }`}
        >
          <FaReceipt /> Your Bills
        </Link>
        <Link
          href="/teams"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            pathname && pathname.startsWith("/teams") ? "bg-[#17223b]" : "hover:bg-[#17223b]"
          }`}
        >
          <FaUsers /> Teams
        </Link>
        <Link
          href="/history"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            pathname === "/history" ? "bg-[#17223b]" : "hover:bg-[#17223b]"
          }`}
        >
          <FaHistory /> History
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            pathname === "/settings" ? "bg-[#17223b]" : "hover:bg-[#17223b]"
          }`}
        >
          <FaCog /> Settings
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-8 px-3 py-2 rounded-lg bg-[#4fd1c5] text-[#10182A] font-semibold hover:bg-[#38b2ac] transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}