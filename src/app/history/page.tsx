"use client";
import { useUser } from "../UserProvider";
import { useEffect, useState } from "react";

interface Bill {
  id: string;
  team: string;
  date: string;
  title: string;
  members: number;
  amount: number;
}

export default function HistoryPage() {
  const { user } = useUser() || {};
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard/history-list?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBills(data.bills || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-white p-8">Loading history...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
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
  );
}
