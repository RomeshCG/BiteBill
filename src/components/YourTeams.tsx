import { UserCircle } from "@phosphor-icons/react";
import Link from "next/link";

type Team = {
  id: string;
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
          <Link
            key={idx}
            href={`/teams/${team.id}`}
            className="bg-[#17223b] rounded-2xl p-6 flex flex-col items-start shadow-lg hover:shadow-xl transition group border border-transparent hover:border-[#4fd1c5] cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#232e47] rounded-full p-2">
                <UserCircle size={28} className="text-[#4fd1c5]" />
              </div>
              <span className="font-bold text-white text-lg group-hover:text-[#4fd1c5] transition">{team.name}</span>
            </div>
            <span className="text-xs text-gray-400 mb-1">{team.members} member{team.members !== 1 && "s"}</span>
          </Link>
        ))}
        <Link
          href="/teams"
          className="bg-[#10182A] border-2 border-dashed border-[#4fd1c5] rounded-2xl p-6 flex flex-col items-center justify-center text-[#4fd1c5] font-bold text-2xl hover:bg-[#17223b] transition cursor-pointer"
        >
          +
          <span className="text-xs font-normal mt-1">New Team</span>
        </Link>
      </div>
    </div>
  );
}