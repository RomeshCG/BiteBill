"use client";
import Link from "next/link";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center py-6 px-8 sm:px-16 bg-gradient-to-r from-blue-700 via-cyan-600 to-green-500 shadow-lg rounded-b-3xl">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white tracking-tight drop-shadow">BiteBill</span>
      </div>
      <nav className="flex gap-4">
        <Link href="/sign-in" className="flex items-center gap-2 text-white hover:text-gray-200 font-medium transition">
          <FaSignInAlt /> Sign In
        </Link>
        <Link href="/register" className="flex items-center gap-2 text-white hover:text-gray-200 font-medium transition">
          <FaUserPlus /> Register
        </Link>
      </nav>
    </header>
  );
}
