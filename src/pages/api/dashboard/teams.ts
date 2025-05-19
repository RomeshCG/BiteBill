import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  // Get all teams for the user
  const { data: teamMembers, error } = await supabase
    .from("team_members")
    .select("team_id, teams(name)")
    .eq("user_id", user_id);

  if (error) return res.status(500).json({ error: error.message });

  type TeamMemberRow = { team_id: string; teams: { name: string }[] };

  // For each team, get member count
  const teams = await Promise.all(
    (teamMembers as TeamMemberRow[] || []).map(async (tm) => {
      const { count } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", tm.team_id);
      return {
        id: tm.team_id,
        name: tm.teams?.[0]?.name || "",
        members: count || 0,
      };
    })
  );

  res.status(200).json({ teams });
}
