import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, user_id } = req.body;
  if (!name || !user_id) return res.status(400).json({ error: "Missing name or user_id" });

  // Create team
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name, created_by: user_id })
    .select()
    .single();
  if (teamError) return res.status(500).json({ error: teamError.message });

  // Add creator as team member
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, user_id });
  if (memberError) return res.status(500).json({ error: memberError.message });

  res.status(200).json({ team });
}
