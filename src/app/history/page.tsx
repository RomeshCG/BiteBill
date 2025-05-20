"use client";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar";

interface Bill {
  id: string;
  team: string;
  date: string;
  title: string;
  members: number;
  amount: number;
}

export default function HistoryPage() {
  const { user, profile, loading } = useUser() || {};
  const [bills, setBills] = useState<Bill[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    fetch(`/api/dashboard/history-list?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBills(data.bills || []);
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
        <DashboardSidebar userName={profile?.full_name || user?.email || "User"} />
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64">
        <div className="sm:mt-0 mt-20 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Bill History</h1>
          <div className="flex flex-col gap-4">
            {bills.map(bill => (
              <div key={bill.id} className="bg-[#17223b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-white">{bill.title}</div>
                  <div className="text-xs text-gray-400">{bill.team} • {bill.date}</div>
                </div>
                <div className="text-lg font-bold text-white mt-2 sm:mt-0">${bill.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
