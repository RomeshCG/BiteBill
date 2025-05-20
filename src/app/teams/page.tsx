"use client";
import { UserCircle } from "@phosphor-icons/react";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar";

interface Team {
  id: string;
  name: string;
  members: number;
}

export default function TeamsPage() {
  const { user, profile, loading } = useUser() || {};
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchTeams = () => {
    if (!user) return;
    fetch(`/api/dashboard/teams-list?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams || []);
      });
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !user) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/dashboard/add-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName, user_id: user.id }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setShowModal(false);
      setNewTeamName("");
      fetchTeams();
    } else {
      setError(data.error || "Failed to create team");
    }
  };

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  console.log("TEAMS FETCHED:", teams);

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
        <DashboardSidebar userName={profile?.full_name || user?.email || "User"} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Teams</h1>
              <button
                className="bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] text-[#10182A] px-6 py-2 rounded-xl font-bold shadow-lg hover:from-[#38b2ac] hover:to-[#4fd1c5] focus:outline-none focus:ring-2 focus:ring-[#4fd1c5] transition text-base"
                onClick={() => setShowModal(true)}
              >
                + New Team
              </button>
            </div>
            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <UserCircle size={64} className="text-[#4fd1c5] mb-4" />
                <div className="text-white text-lg font-semibold mb-2">No teams yet</div>
                <div className="text-gray-400 mb-4 text-center">Create your first team to start splitting bills and collaborating!</div>
                <button
                  className="bg-[#4fd1c5] text-[#10182A] px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#38b2ac] focus:outline-none focus:ring-2 focus:ring-[#4fd1c5] transition"
                  onClick={() => setShowModal(true)}
                >
                  + Create Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="bg-[#17223b] rounded-2xl p-6 flex flex-col items-start shadow-lg hover:shadow-xl transition group border border-transparent hover:border-[#4fd1c5]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#232e47] rounded-full p-2">
                        <UserCircle size={28} className="text-[#4fd1c5]" />
                      </div>
                    </div>
                    <span className="font-bold text-white text-lg mb-1 group-hover:text-[#4fd1c5] transition">{team.name}</span>
                    <span className="text-xs text-gray-400 mb-1">{team.members} member{team.members !== 1 && "s"}</span>
                    {/* Optionally show team id for debugging: */}
                    {/* <span className="text-[10px] text-gray-600 mt-1">ID: {team.id}</span> */}
                  </div>
                ))}
              </div>
            )}
            {/* Modal for new team creation */}
            {showModal && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60">
                <form
                  onSubmit={handleCreateTeam}
                  className="bg-white dark:bg-[#181825] rounded-xl p-6 w-full max-w-xs mx-auto flex flex-col gap-4 shadow-lg animate-fadeIn"
                >
                  <h2 className="text-xl font-bold text-center text-[#4fd1c5]">Create New Team</h2>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#4fd1c5]"
                    placeholder="Team name"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    autoFocus
                    maxLength={32}
                    required
                  />
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => { setShowModal(false); setError(""); }}
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded bg-[#4fd1c5] text-[#10182A] font-semibold hover:bg-[#38b2ac] transition"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
