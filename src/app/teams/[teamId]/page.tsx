'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FaBars } from "react-icons/fa";
import { useUser } from "@/app/UserProvider";
import { formatCurrency } from '@/utils/currency';

interface Member {
  user_id: string;
  joined_at: string;
  full_name?: string | null;
  is_removed?: boolean;
  removed_at?: string | null;
}

interface Split {
  id: string;
  receipt_id: string;
  user_id: string;
  amount_owed: number;
  is_removed?: boolean;
}

interface Receipt {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
  splits: Split[];
}

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params && typeof params.teamId === 'string' ? params.teamId : Array.isArray(params?.teamId) ? params.teamId[0] : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Add created_by to team type
  const [team, setTeam] = useState<{ id: string; name: string; created_at: string; created_by?: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useUser() || {};

  // Add Team Member form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

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
        setTeam(data.team); // team.created_by will now be present
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

  // Add Team Member handler
  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setInviteStatus(null);
    setInviteLoading(true);
    try {
      const res = await fetch("/api/dashboard/add-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          email: inviteEmail,
          invited_by: profile?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteStatus(data.message || "Success");
        setInviteEmail("");
      } else {
        setInviteStatus(data.error || "Error sending invite");
      }
    } catch {
      setInviteStatus("Error sending invite");
    } finally {
      setInviteLoading(false);
    }
  }

  // Remove Team Member handler
  async function handleRemoveMember(userId: string) {
    if (!team || !profile?.id) return;
    
    setRemovingMember(userId);
    try {
      const res = await fetch("/api/dashboard/remove-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          user_id: userId,
          removed_by: profile.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh team details
        const teamRes = await fetch(`/api/team-details?teamId=${teamId}`);
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData.team);
          setMembers(teamData.members);
        }
      } else {
        setError(data.error || "Failed to remove member");
      }
    } catch (err) {
      setError("Error removing team member");
    } finally {
      setRemovingMember(null);
    }
  }

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
        <div className="sm:mt-0 mt-20 w-full max-w-2xl">
          <div className="bg-[#17223b] rounded-2xl p-6 mb-6 shadow-lg border border-[#232e47]">
            <h1 className="text-2xl font-bold text-white mb-2">{team?.name}</h1>
            <div className="text-sm text-gray-400 mb-2">Created at: {team ? new Date(team.created_at).toLocaleDateString() : ""}</div>
            {/* Add Team Member Form - only for team creator */}
            {profile?.id === team?.created_by && (
              <form onSubmit={handleAddMember} className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                <input
                  type="email"
                  required
                  placeholder="Enter member's email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="rounded px-3 py-2 border border-[#4fd1c5] bg-[#10182A] text-white focus:outline-none focus:ring-2 focus:ring-[#4fd1c5]"
                  disabled={inviteLoading}
                />
                <button
                  type="submit"
                  className="bg-[#4fd1c5] text-[#10182A] font-semibold px-4 py-2 rounded hover:bg-[#38b2ac] transition-colors disabled:opacity-50"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? "Adding..." : "Add Member"}
                </button>
                {inviteStatus && (
                  <span className={`ml-2 text-sm ${inviteStatus.includes("success") || inviteStatus.includes("added") ? "text-green-400" : "text-red-400"}`}>{inviteStatus}</span>
                )}
              </form>
            )}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-[#4fd1c5] mb-2">Members</h2>
              <ul className="divide-y divide-[#232e47]">
                {members.map((m) => (
                  <li
                    key={m.user_id}
                    className={`py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between ${m.is_removed ? 'opacity-50' : ''}`}
                  >
                    <span className={`font-medium truncate max-w-[150px] ${m.is_removed ? 'text-red-400' : 'text-white'}`}>{m.full_name ? m.full_name : 'Unknown Member'} {m.is_removed && <span className="ml-1 text-xs">(Removed)</span>}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">Joined: {new Date(m.joined_at).toLocaleDateString()}</span>
                      {profile?.id === team?.created_by && m.user_id !== team?.created_by && !m.is_removed && (
                        <button
                          onClick={() => handleRemoveMember(m.user_id)}
                          disabled={removingMember === m.user_id}
                          className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                        >
                          {removingMember === m.user_id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
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
                  <li key={r.id} className="py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <span className="text-white font-medium truncate max-w-[150px]">{r.title}</span>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {r.splits.map((split) => {
                        const memberInfo = members.find(m => m.user_id === split.user_id);
                        return (
                          <div key={split.id} className={`flex justify-between items-center ${split.is_removed ? 'text-red-400 opacity-70' : ''}`}>
                            <span>
                              {memberInfo?.full_name || 'Unknown Member'}
                              {split.is_removed && <span className="ml-1 text-xs">(Removed)</span>}
                            </span>
                            <span className={split.amount_owed > 0 ? 'text-green-400' : split.amount_owed < 0 ? 'text-red-400' : ''}>
                              {split.amount_owed > 0 ? `+${formatCurrency(split.amount_owed)}` : split.amount_owed < 0 ? `-${formatCurrency(Math.abs(split.amount_owed))}` : formatCurrency(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
