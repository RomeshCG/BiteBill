import React, { useState } from 'react';
import AddBillModal from './AddBillModal';

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

const BillsSection = ({ teams = [], currentUserId = "" }: { teams?: Team[]; currentUserId?: string }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'owe'>('all');
  const [showModal, setShowModal] = useState(false);

  return (
    <div id="your-bills-section" className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Bills</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
          onClick={() => setShowModal(true)}
        >
          <span className="text-xl">+</span> Add Bill
        </button>
      </div>
      <div className="flex gap-2 mb-4">
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
      </div>
      <div className="bg-[#18181b] rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] text-center border border-[#23232a]">
        <p className="text-lg font-semibold text-gray-200 mb-2">No bills yet</p>
        <p className="text-gray-400">Add your first bill using the button below</p>
      </div>
      <AddBillModal open={showModal} onClose={() => setShowModal(false)} teams={teams} currentUserId={currentUserId} />
    </div>
  );
};

export default BillsSection;
