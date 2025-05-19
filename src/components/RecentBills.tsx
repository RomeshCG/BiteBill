type Bill = {
  team: string;
  date: string;
  members: number;
  amount: number;
};

export default function RecentBills({ bills }: { bills: Bill[] }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Recent Bills</h2>
        <button className="text-[#4fd1c5] text-sm font-medium">View All &rarr;</button>
      </div>
      <div className="flex flex-col gap-3">
        {bills.map((bill, idx) => (
          <div key={idx} className="bg-[#17223b] rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-white">{bill.team}</div>
              <div className="text-xs text-gray-400">{bill.date} • {bill.members} members</div>
            </div>
            <div className="text-lg font-bold text-white">${bill.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}