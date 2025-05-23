import React, { useState, useEffect } from 'react';

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

const mockCategories = [
  'Food',
  'Travel',
  'Utilities',
  'Entertainment',
  'Other',
];

const AddBillModal = ({ open, onClose, teams = [], currentUserId = "", editMode = false, editBill = null }: { open: boolean; onClose: () => void; teams?: Team[]; currentUserId?: string; editMode?: boolean; editBill?: any }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [percentageSplits, setPercentageSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payers, setPayers] = useState<string[]>([currentUserId]);
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({ [currentUserId]: amount });

  // Pre-fill fields in edit mode
  useEffect(() => {
    if (editMode && editBill) {
      setTitle(editBill.title || '');
      setAmount(editBill.amount ? String(editBill.amount) : '');
      // Defensive date parsing
      let parsedDate = '';
      if (editBill.date) {
        const d = new Date(editBill.date);
        if (!isNaN(d.getTime())) {
          parsedDate = d.toISOString().slice(0, 10);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(editBill.date)) {
          // If already in dd/mm/yyyy, convert to yyyy-mm-dd
          const [day, month, year] = editBill.date.split('/');
          parsedDate = `${year}-${month}-${day}`;
        } else {
          parsedDate = '';
        }
      }
      setDate(parsedDate);
      setSelectedTeamId(editBill.team_id || '');
      // TODO: fetch and set splits, payers, etc. if available
    } else if (!open) {
      setTitle(''); setAmount(''); setDate(''); setSelectedTeamId(''); setSelectedMembers([]); setSplitMethod('equal'); setCustomSplits({}); setPercentageSplits({}); setPayers([currentUserId]); setPayerAmounts({ [currentUserId]: '' });
    }
  }, [editMode, editBill, open, currentUserId]);

  // Reset members when team changes
  useEffect(() => {
    if (selectedTeamId && Array.isArray(teams)) {
      const team = teams.find(t => t.id === selectedTeamId);
      if (team) {
        setSelectedMembers([currentUserId]); // Always include creator
        setCustomSplits({ [currentUserId]: '' });
        setPercentageSplits({ [currentUserId]: '' });
      }
    }
  }, [selectedTeamId, currentUserId, teams]);

  if (!open) return null;

  const selectedTeam = Array.isArray(teams) ? teams.find(t => t.id === selectedTeamId) : undefined;
  const members = selectedTeam && Array.isArray(selectedTeam.members) ? selectedTeam.members : [];

  // Bill creation handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Calculate splits
      let splits: { user_id: string; amount_owed: number }[] = [];
      const total = parseFloat(amount);
      if (!selectedTeamId || !title || !total || !date || selectedMembers.length === 0) {
        setError('Please fill all required fields.');
        setLoading(false);
        return;
      }
      if (splitMethod === 'equal') {
        const share = parseFloat((total / selectedMembers.length).toFixed(2));
        splits = selectedMembers.map(uid => ({ user_id: uid, amount_owed: share }));
      } else if (splitMethod === 'custom') {
        let sum = 0;
        splits = selectedMembers.map(uid => {
          const val = parseFloat(customSplits[uid] || '0');
          sum += val;
          return { user_id: uid, amount_owed: val };
        });
        if (Math.abs(sum - total) > 0.01) {
          setError('Custom amounts must sum to total amount.');
          setLoading(false);
          return;
        }
      } else if (splitMethod === 'percentage') {
        let sum = 0;
        splits = selectedMembers.map(uid => {
          const percent = parseFloat(percentageSplits[uid] || '0');
          sum += percent;
          return { user_id: uid, amount_owed: parseFloat(((percent / 100) * total).toFixed(2)) };
        });
        if (Math.abs(sum - 100) > 0.01) {
          setError('Percentages must sum to 100%.');
          setLoading(false);
          return;
        }
      }
      // Calculate payments
      let payments: { user_id: string; amount_paid: number }[] = [];
      if (payers.length === 0) {
        payments = []; // No one has paid yet
      } else if (payers.length === 1) {
        payments = [{ user_id: payers[0], amount_paid: total }];
      } else {
        let sum = 0;
        payments = payers.map(uid => {
          const val = parseFloat(payerAmounts[uid] || '0');
          sum += val;
          return { user_id: uid, amount_paid: val };
        });
        if (Math.abs(sum - total) > 0.01) {
          setError('Payer amounts must sum to total amount.');
          setLoading(false);
          return;
        }
      }
      if (editMode && editBill) {
        // Edit bill
        const res = await fetch('/api/dashboard/edit-receipt', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receipt_id: editBill.id,
            user_id: currentUserId,
            title,
            amount: total,
            date,
            splits,
            payments,
          })
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to edit bill.');
          setLoading(false);
          return;
        }
      } else {
        // Add bill
        const res = await fetch('/api/dashboard/add-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: selectedTeamId,
            created_by: currentUserId,
            title,
            amount: total,
            date,
            members: selectedMembers,
            split_type: splitMethod,
            splits,
            payments,
          })
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to create bill.');
          setLoading(false);
          return;
        }
      }
      // Success
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError('Failed to save bill.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#18181b] rounded-xl w-full max-w-full sm:max-w-md p-4 sm:p-8 relative text-white shadow-lg mx-2">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6">{editMode ? 'Edit Bill' : 'Add New Bill'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Team</label>
            <select
              className="w-full rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none"
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Bill Title</label>
            <input
              className="w-full rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter bill title"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Total Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              className="w-full rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Select Team Members</label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(members) ? members.map(member => (
                <button
                  type="button"
                  key={member.id}
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${selectedMembers.includes(member.id)
                    ? 'bg-blue-700 border-blue-700 text-white'
                    : 'bg-[#23232a] border-[#23232a] text-gray-300'} ${member.isCreator ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={!!member.isCreator}
                  onClick={() => {
                    if (!member.isCreator) {
                      setSelectedMembers(m => m.includes(member.id)
                        ? m.filter(id => id !== member.id)
                        : [...m, member.id]);
                    }
                  }}
                >
                  {member.name}
                </button>
              )) : null}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Split Method</label>
            <div className="flex gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${splitMethod === 'equal' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-[#23232a] border-[#23232a] text-gray-300'}`}
                onClick={() => setSplitMethod('equal')}
              >
                Equal Split
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${splitMethod === 'custom' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-[#23232a] border-[#23232a] text-gray-300'}`}
                onClick={() => setSplitMethod('custom')}
              >
                Custom Amount
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${splitMethod === 'percentage' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-[#23232a] border-[#23232a] text-gray-300'}`}
                onClick={() => setSplitMethod('percentage')}
              >
                Percentage
              </button>
            </div>
          </div>
          {/* Custom/Percentage Split Inputs */}
          {splitMethod === 'custom' && (
            <div>
              <label className="block mb-1 font-medium">Custom Amounts</label>
              {Array.isArray(selectedMembers) ? selectedMembers.map(memberId => {
                const member = Array.isArray(members) ? members.find(m => m.id === memberId) : undefined;
                return (
                  <div key={memberId} className="flex items-center gap-2 mb-2">
                    <span className="w-32 truncate">{member?.name || memberId}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none flex-1"
                      value={customSplits[memberId] || ''}
                      onChange={e => setCustomSplits(s => ({ ...s, [memberId]: e.target.value }))}
                      placeholder="Amount"
                    />
                  </div>
                );
              }) : null}
            </div>
          )}
          {splitMethod === 'percentage' && (
            <div>
              <label className="block mb-1 font-medium">Percentages</label>
              {Array.isArray(selectedMembers) ? selectedMembers.map(memberId => {
                const member = Array.isArray(members) ? members.find(m => m.id === memberId) : undefined;
                return (
                  <div key={memberId} className="flex items-center gap-2 mb-2">
                    <span className="w-32 truncate">{member?.name || memberId}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none flex-1"
                      value={percentageSplits[memberId] || ''}
                      onChange={e => setPercentageSplits(s => ({ ...s, [memberId]: e.target.value }))}
                      placeholder="%"
                    />
                  </div>
                );
              }) : null}
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">Who Paid? <span className="text-gray-400 text-xs">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(members) ? members.map(member => (
                <button
                  type="button"
                  key={member.id}
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${payers.includes(member.id)
                    ? 'bg-green-700 border-green-700 text-white'
                    : 'bg-[#23232a] border-[#23232a] text-gray-300'}`}
                  onClick={() => {
                    setPayers(p => p.includes(member.id)
                      ? p.filter(id => id !== member.id)
                      : [...p, member.id]);
                  }}
                >
                  {member.name}
                </button>
              )) : null}
            </div>
            {payers.length > 1 && (
              <div className="space-y-2">
                {payers.map(uid => {
                  const member = members.find(m => m.id === uid);
                  return (
                    <div key={uid} className="flex items-center gap-2">
                      <span className="w-32 truncate">{member?.name || uid}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="rounded-md bg-[#23232a] border border-[#23232a] focus:border-blue-500 px-3 py-2 outline-none flex-1"
                        value={payerAmounts[uid] || ''}
                        onChange={e => setPayerAmounts(a => ({ ...a, [uid]: e.target.value }))}
                        placeholder="Amount paid"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-[#23232a] bg-[#23232a] text-gray-300 hover:bg-[#23232a]/80"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (editMode ? 'Saving...' : 'Creating...') : (editMode ? 'Save Changes' : 'Create Bill')}
            </button>
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddBillModal;
