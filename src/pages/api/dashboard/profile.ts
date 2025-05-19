import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from cookie/session (for demo, use query param)
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user_id)
    .single<Profile>();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ profile: data });
}
