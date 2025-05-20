import Link from "next/link";

type Team = {
  name: string;
  members: number;
};

export default function YourTeams({ teams }: { teams: Team[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Your Teams</h2>
        <Link href="/teams" className="text-[#4fd1c5] text-sm font-medium hover:underline">
          Manage Teams &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {teams.map((team, idx) => (
          <div key={idx} className="bg-[#17223b] rounded-xl p-4 flex flex-col items-start">
            <div className="font-semibold text-white text-base">{team.name}</div>
            <div className="text-xs text-gray-400">{team.members} members</div>
          </div>
        ))}
        <Link
          href="/teams"
          className="bg-[#10182A] border-2 border-dashed border-[#4fd1c5] rounded-xl p-4 flex flex-col items-center justify-center text-[#4fd1c5] font-bold text-2xl hover:bg-[#17223b] transition cursor-pointer"
        >
          +
          <span className="text-xs font-normal mt-1">New Team</span>
        </Link>
      </div>
    </div>
  );
}