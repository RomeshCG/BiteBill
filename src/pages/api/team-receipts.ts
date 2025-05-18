import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { team_id } = req.query;
  if (!team_id) return res.status(400).json({ error: "Missing team_id" });

  const { data, error } = await supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("team_id", team_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ receipts: data });
}