'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FaBars } from "react-icons/fa";

interface Member {
  user_id: string;
  joined_at: string;
  full_name?: string | null;
}

interface Receipt {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
}

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params && typeof params.teamId === 'string' ? params.teamId : Array.isArray(params?.teamId) ? params.teamId[0] : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [team, setTeam] = useState<{ id: string; name: string; created_at: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  useEffect(() => {
    async function fetchTeamDetails() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/team-details?teamId=${teamId}`);
        if (!res.ok) throw new Error("Failed to fetch team details");
        const data = await res.json();
        setTeam(data.team);
        setMembers(data.members);
        setReceipts(data.receipts);
      } catch {
        setError("Could not load team details.");
      } finally {
        setLoading(false);
      }
    }
    if (teamId) fetchTeamDetails();
  }, [teamId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-400">{error}</div>;
  if (!team) return <div className="flex items-center justify-center min-h-screen text-gray-400">Team not found.</div>;

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
        <DashboardSidebar userName={members[0]?.full_name || ""} />
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center w-full p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20 w-full max-w-2xl"> {/* Push content down on mobile for toggle button */}
          <div className="bg-[#17223b] rounded-2xl p-6 mb-6 shadow-lg border border-[#232e47]">
            <h1 className="text-2xl font-bold text-white mb-2">{team?.name}</h1>
            <div className="text-sm text-gray-400 mb-2">Created at: {team ? new Date(team.created_at).toLocaleDateString() : ""}</div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-[#4fd1c5] mb-2">Members</h2>
              <ul className="divide-y divide-[#232e47]">
                {members.map((m) => (
                  <li key={m.user_id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-white font-medium truncate max-w-[150px]">{m.full_name ? m.full_name : 'Unknown Member'}</span>
                    <span className="text-xs text-gray-400">Joined: {new Date(m.joined_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-[#17223b] rounded-2xl p-6 shadow-lg border border-[#232e47]">
            <h2 className="text-lg font-semibold text-[#4fd1c5] mb-4">Bill History</h2>
            {receipts.length === 0 ? (
              <div className="text-gray-400 text-sm">No bills yet.</div>
            ) : (
              <ul className="divide-y divide-[#232e47]">
                {receipts.map((r) => (
                  <li key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-white font-medium truncate max-w-[150px]">{r.title}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
