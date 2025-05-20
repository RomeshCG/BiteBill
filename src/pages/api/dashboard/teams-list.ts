import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  // Get all teams for the user
  const { data: teamMembers, error: teamError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user_id);
  if (teamError) return res.status(500).json({ error: teamError.message });

  const teamIds = (teamMembers || []).map((tm: { team_id: string }) => tm.team_id);
  if (teamIds.length === 0) return res.status(200).json({ teams: [] });

  // Fetch all member counts in one query
  const { data: allMembers, error: countError } = await supabase
    .from("team_members")
    .select("team_id")
    .in("team_id", teamIds);
  if (countError) return res.status(500).json({ error: countError.message });

  // Fetch team names in one query
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds);
  if (teamsError) return res.status(500).json({ error: teamsError.message });
  const teamNameMap: Record<string, string> = {};
  (teamsData || []).forEach((row: { id: string; name: string }) => {
    teamNameMap[row.id] = row.name;
  });

  // Count members per team
  const memberCountMap: Record<string, number> = {};
  (allMembers || []).forEach((row: { team_id: string }) => {
    memberCountMap[row.team_id] = (memberCountMap[row.team_id] || 0) + 1;
  });

  // Build teams array
  const teams = (teamIds || []).map((id: string) => ({
    id,
    name: teamNameMap[id] || "",
    members: memberCountMap[id] || 0,
  }));

  res.status(200).json({ teams });
}
