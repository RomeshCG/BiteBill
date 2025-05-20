"use client";
import { UserCircle } from "@phosphor-icons/react";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  members: number;
}

export default function TeamsPage() {
  const { user } = useUser() || {};
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchTeams = () => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/dashboard/teams-list?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams || []);
        setLoading(false);
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

  if (loading) return <div className="text-white p-8">Loading teams...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 w-full">
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
                <span className="font-bold text-white text-lg group-hover:text-[#4fd1c5] transition">{team.name}</span>
              </div>
              <span className="text-xs text-gray-400 mb-1">{team.members} member{team.members !== 1 && "s"}</span>
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
  );
}
