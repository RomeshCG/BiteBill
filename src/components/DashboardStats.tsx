export default function DashboardStats({
  totalSpent,
  activeTeams,
  billsCreated,
}: {
  totalSpent: number;
  activeTeams: number;
  billsCreated: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-[#17223b] rounded-xl p-6 flex flex-col">
        <span className="text-sm text-gray-400 mb-1">Total Spent This Month</span>
        <span className="text-3xl font-bold text-white">${totalSpent.toFixed(2)}</span>
      </div>
      <div className="bg-[#17223b] rounded-xl p-6 flex flex-col">
        <span className="text-sm text-gray-400 mb-1">Active Teams</span>
        <span className="text-3xl font-bold text-white">{activeTeams}</span>
      </div>
      <div className="bg-[#17223b] rounded-xl p-6 flex flex-col">
        <span className="text-sm text-gray-400 mb-1">Bills Created</span>
        <span className="text-3xl font-bold text-white">{billsCreated}</span>
      </div>
    </div>
  );
}