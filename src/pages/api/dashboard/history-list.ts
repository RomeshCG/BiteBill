import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  // Get all receipts for teams the user is a member of
  const { data: teamMembers, error: teamError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user_id);
  if (teamError) return res.status(500).json({ error: teamError.message });
  const teamIds = (teamMembers || []).map((tm: { team_id: string }) => tm.team_id);

  // Get all receipts for these teams
  const { data: receipts, error } = await supabase
    .from("receipts")
    .select("id, team_id, title, created_at, team:teams(name), receipt_items(amount)")
    .in("team_id", teamIds)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  type ReceiptRow = {
    id: string;
    team: { name: string }[];
    created_at: string;
    team_id: string;
    title: string;
    receipt_items: { amount: number }[];
  };

  const bills = (receipts || []).map((r: ReceiptRow) => ({
    id: r.id,
    team: r.team?.[0]?.name || "",
    date: new Date(r.created_at).toLocaleDateString(),
    title: r.title,
    members: 0, // You can fetch member count if needed
    amount: (r.receipt_items || []).reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0),
  }));

  res.status(200).json({ bills });
}
