import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, user_id } = req.body;
  if (!name || !user_id) return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase
    .from("teams")
    .insert([{ name, created_by: user_id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Add creator as team member
  await supabase.from("team_members").insert([{ team_id: data.id, user_id }]);

  res.status(200).json({ team: data });
}