import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  // Get user profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, created_at")
    .eq("id", user_id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ profile });
}
