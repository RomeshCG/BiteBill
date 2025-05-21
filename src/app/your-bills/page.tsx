"use client";
import BillsSection from '../../components/BillsSection';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";

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

  return (
    <div className="flex min-h-screen bg-[#10182A]">
      <aside className="w-64">
        <DashboardSidebar userName={profile?.full_name || user?.email || "User"} />
      </aside>
      <main className="flex-1 p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Your Bills</h1>
        <BillsSection teams={teams} currentUserId={user.id} />
      </main>
    </div>
  );
} 