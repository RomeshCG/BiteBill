"use client";
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

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard/teams-list?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-white p-8">Loading teams...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Your Teams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-[#17223b] rounded-xl p-4 flex flex-col">
            <span className="font-semibold text-white">{team.name}</span>
            <span className="text-xs text-gray-400">{team.members} members</span>
          </div>
        ))}
      </div>
    </div>
  );
}
