import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { receipt_id, user_id } = req.body;
  if (!receipt_id || !user_id) return res.status(400).json({ error: "Missing fields" });

  const { error } = await supabase
    .from("splits")
    .update({ settled: true, settled_at: new Date().toISOString(), settled_by: user_id })
    .eq("receipt_id", receipt_id)
    .eq("user_id", user_id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
} 