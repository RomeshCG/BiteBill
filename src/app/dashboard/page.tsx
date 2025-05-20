"use client";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardStats from "../../components/DashboardStats";
import RecentBills from "../../components/RecentBills";
import YourTeams from "../../components/YourTeams";
import { FaBars } from "react-icons/fa";

// Types for teams and bills
interface Team {
  name: string;
  members: number;
  id: string;
}
interface Bill {
  team: string;
  date: string;
  members: number;
  amount: number;
}

export default function DashboardPage() {
  const { user, profile, loading } = useUser() || {};
  const [stats, setStats] = useState({ totalSpent: 0, activeTeams: 0, billsCreated: 0 });
  const [bills, setBills] = useState<Bill[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setDataLoading(true);
      // Fetch teams
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);
      const teamIds = (teamMembers || []).map((tm: { team_id: string }) => tm.team_id);
      let userTeams: Team[] = [];
      if (teamIds.length > 0) {
        // Fetch team names
        const { data: teamsData } = await supabase
          .from("teams")
          .select("id, name")
          .in("id", teamIds);
        const teamNameMap: Record<string, string> = {};
        (teamsData || []).forEach((row: { id: string; name: string }) => {
          teamNameMap[row.id] = row.name;
        });
        // Fetch all member counts in one query
        const { data: allMembers } = await supabase
          .from("team_members")
          .select("team_id")
          .in("team_id", teamIds);
        const memberCountMap: Record<string, number> = {};
        (allMembers || []).forEach((row: { team_id: string }) => {
          memberCountMap[row.team_id] = (memberCountMap[row.team_id] || 0) + 1;
        });
        userTeams = (teamIds || []).map((id: string) => ({
          id,
          name: teamNameMap[id] || "",
          members: memberCountMap[id] || 0,
        }));
      }
      setTeams(userTeams);
      // Fetch receipts (bills)
      type ReceiptRow = {
        team: { name: string }[];
        created_at: string;
        team_id: string;
        receipt_items: { amount: number }[];
        title: string;
        id: string;
      };
      const { data: receipts } = await supabase
        .from("receipts")
        .select("id, team_id, title, created_at, team:teams(name), receipt_items(amount)")
        .in("team_id", userTeams.map(t => t.id))
        .order("created_at", { ascending: false })
        .limit(5);
      const billsData: Bill[] = (receipts || []).map((r: ReceiptRow) => ({
        team: r.team?.[0]?.name || "",
        date: new Date(r.created_at).toLocaleDateString(),
        members: userTeams.find(t => t.id === r.team_id)?.members || 0,
        amount: (r.receipt_items || []).reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0),
      }));
      setBills(billsData);
      // Stats
      setStats({
        totalSpent: billsData.reduce((sum, b) => sum + b.amount, 0),
        activeTeams: userTeams.length,
        billsCreated: receipts?.length || 0,
      });
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  // Responsive sidebar toggle
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  if (loading || dataLoading) {
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
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
          <DashboardStats {...stats} />
          <RecentBills bills={bills} />
          <YourTeams teams={teams} />
        </div>
      </main>
    </div>
  );
}