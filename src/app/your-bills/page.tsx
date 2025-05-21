"use client";
import BillsSection from '../../components/BillsSection';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
  isCreator?: boolean;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

export default function YourBillsPage() {
  const { user, profile, loading } = useUser() || {};
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      if (!user) return;
      setTeamsLoading(true);
      // Fetch teams for user
      const res = await fetch(`/api/dashboard/teams-list?user_id=${user.id}`);
      const data = await res.json();
      const teamList = data.teams || [];
      // For each team, fetch members
      const teamsWithMembers = await Promise.all(teamList.map(async (team: any) => {
        const membersRes = await fetch(`/api/team-details?teamId=${team.id}`);
        const membersData = await membersRes.json();
        return {
          id: team.id,
          name: team.name,
          members: (membersData.members || []).map((m: any) => ({
            id: m.user_id,
            name: m.full_name,
            avatar_url: m.avatar_url,
            isCreator: false // You can set this if needed
          })),
        };
      }));
      setTeams(teamsWithMembers);
      setTeamsLoading(false);
    }
    fetchTeams();
  }, [user]);

  if (loading || teamsLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  return (
    <div className="flex min-h-screen bg-[#10182A]">
      {/* Mobile sidebar toggle button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-30 bg-[#232e47] hover:bg-[#4fd1c5] hover:text-[#232e47] p-3 rounded-full text-white shadow-lg border-2 border-[#4fd1c5] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4fd1c5]"
        onClick={handleSidebarToggle}
        aria-label="Open sidebar"
      >
        <FaBars size={24} />
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
        <DashboardSidebar userName={profile?.full_name || user?.email || "User"} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20"> {/* Push content down on mobile for toggle button */}
          <h1 className="text-2xl font-bold text-white mb-6">Your Bills</h1>
          <BillsSection teams={teams} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
} 