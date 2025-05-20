"use client";
import DashboardSidebar from "../../components/DashboardSidebar";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function SettingsPage() {
  const { user, profile: userProfile, loading } = useUser() || {};
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    fetch(`/api/dashboard/settings-profile?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || null);
        setDataLoading(false);
      });
  }, [user]);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  if (loading || dataLoading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#10182A]">
      {/* Mobile sidebar toggle button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-30 bg-[#232e47] hover:bg-[#4fd1c5] hover:text-[#232e47] p-3 rounded-full text-white shadow-lg border-2 border-[#4fd1c5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4fd1c5]"
        onClick={handleSidebarToggle}
        aria-label="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-40 sm:hidden"
          onClick={handleSidebarToggle}
        />
      )}
      {/* Sidebar (hidden on mobile unless open) */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-[#10182A] transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:static sm:translate-x-0 sm:w-64`}
      >
        <DashboardSidebar userName={userProfile?.full_name || user?.email || "User"} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          {profile && (
            <div className="bg-[#17223b] rounded-xl p-6 flex flex-col items-center">
                <Image
                  src={profile.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full mb-4"
                />
              <div className="font-semibold text-white text-lg mb-2">{profile.full_name}</div>
              <div className="text-xs text-gray-400 mb-2">User ID: {profile.id}</div>
              <div className="text-xs text-gray-400">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
