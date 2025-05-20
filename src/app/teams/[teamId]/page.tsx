'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Member {
  user_id: string;
  joined_at: string;
  profiles: { full_name: string } | null;
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

  if (loading) return <div className="text-center text-white py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-400 py-10">{error}</div>;
  if (!team) return <div className="text-center text-gray-400 py-10">Team not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-2 py-6 sm:px-4">
      <div className="bg-[#17223b] rounded-2xl p-6 mb-6 shadow-lg border border-[#232e47]">
        <h1 className="text-2xl font-bold text-white mb-2">{team.name}</h1>
        <div className="text-sm text-gray-400 mb-2">Created at: {new Date(team.created_at).toLocaleDateString()}</div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-[#4fd1c5] mb-2">Members</h2>
          <ul className="divide-y divide-[#232e47]">
            {members.map((m) => (
              <li key={m.user_id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-white font-medium">{m.profiles?.full_name || m.user_id}</span>
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
                <span className="text-white font-medium">{r.title}</span>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
