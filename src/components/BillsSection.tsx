import React, { useState, useEffect } from 'react';
import AddBillModal from './AddBillModal';
import { formatCurrency } from '@/utils/currency';

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

interface Bill {
  id: string;
  team: string;
  date: string;
  title: string;
  amount: number;
}

const BillsSection = ({ teams = [], currentUserId = "" }: { teams?: Team[]; currentUserId?: string }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'owe' | 'settled'>('all');
  const [showModal, setShowModal] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const fetchBills = async (tab: 'all' | 'paid' | 'owe' | 'settled') => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await fetch(`/api/dashboard/bills?user_id=${currentUserId}&filter=${tab}${selectedTeam ? `&team_id=${selectedTeam}` : ''}`);
    const data = await res.json();
    setBills(data.bills || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBills(activeTab);
    // eslint-disable-next-line
  }, [activeTab, currentUserId, selectedTeam]);

  const handleBillAdded = () => {
    setShowModal(false);
    setEditBill(null);
    fetchBills(activeTab);
  };

  const handleEdit = (bill: Bill) => {
    setEditBill(bill);
    setShowModal(true);
  };

  return (
    <div id="your-bills-section" className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
          onClick={() => setShowModal(true)}
        >
          <span className="text-xl">+</span> Add Bill
        </button>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-2">
          <button
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'all' ? 'bg-white text-black' : 'bg-[#23232a] text-gray-300'}`}
            onClick={() => setActiveTab('all')}
          >
            All Bills
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'paid' ? 'bg-white text-black' : 'bg-[#23232a] text-gray-300'}`}
            onClick={() => setActiveTab('paid')}
          >
            You Paid
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'owe' ? 'bg-white text-black' : 'bg-[#23232a] text-gray-300'}`}
            onClick={() => setActiveTab('owe')}
          >
            You Owe
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'settled' ? 'bg-white text-black' : 'bg-[#23232a] text-gray-300'}`}
            onClick={() => setActiveTab('settled')}
          >
            Settled
          </button>
        </div>
        <div className="flex gap-2">
          <select
            className="w-full rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none text-white"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-[#18181b] rounded-xl p-4 sm:p-8 flex flex-col items-center justify-center min-h-[200px] text-center border border-[#23232a]">
        {loading ? (
          <p className="text-lg font-semibold text-gray-200 mb-2">Loading...</p>
        ) : bills.length === 0 ? (
          <>
            <p className="text-lg font-semibold text-gray-200 mb-2">No bills yet</p>
            <p className="text-gray-400">Add your first bill using the button below</p>
          </>
        ) : (
          <ul className="w-full">
            {bills.map(bill => (
              <li key={bill.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-[#23232a] last:border-b-0 gap-2 sm:gap-0 text-left">
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-white">{bill.title} <span className="text-[#4fd1c5]">– {bill.team}</span></span>
                  <span className="text-xs text-gray-400">{bill.date}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                  {activeTab === 'owe' ? (
                    <>
                      <span className="font-bold text-[#f87171]">You owe {formatCurrency(bill.amount)}</span>
                      <button
                        className="px-2 py-1 rounded bg-green-600 text-xs text-white hover:bg-green-700 transition"
                        onClick={async () => {
                          await fetch('/api/dashboard/settle-split', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ receipt_id: bill.id, user_id: currentUserId }),
                          });
                          fetchBills(activeTab); // Refresh
                        }}
                      >
                        Settle Up
                      </button>
                    </>
                  ) : activeTab === 'paid' ? (
                    <span className="font-bold text-[#38b2ac]">You paid {formatCurrency(bill.amount)}</span>
                  ) : activeTab === 'settled' ? (
                    <span className="font-bold text-green-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Settled {formatCurrency(bill.amount)}
                    </span>
                  ) : (
                    <span className="font-bold text-[#4fd1c5]">{formatCurrency(bill.amount)}</span>
                  )}
                  <button
                    className="px-2 py-1 rounded bg-[#23232a] text-xs text-white border border-[#4fd1c5] hover:bg-[#4fd1c5] hover:text-[#23232a] transition"
                    onClick={() => handleEdit(bill)}
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <AddBillModal open={showModal} onClose={handleBillAdded} teams={teams} currentUserId={currentUserId} editBill={editBill} editMode={!!editBill} />
    </div>
  );
};

export default BillsSection;
