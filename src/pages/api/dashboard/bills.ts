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
  const teamIds = (teamMembers || []).map((tm: TeamMember) => tm.team_id);

  // Get recent receipts for these teams
  const { data: receipts, error } = await supabase
    .from("receipts")
    .select("id, team_id, title, created_at, team:teams(name), receipt_items(amount)")
    .in("team_id", teamIds)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return res.status(500).json({ error: error.message });

  type ReceiptRow = {
    team: { name: string }[];
    created_at: string;
    team_id: string;
    receipt_items: { amount: number }[];
  };

  // Format bills
  const bills = (receipts || []).map((r: ReceiptRow) => ({
    team: r.team?.[0]?.name || "",
    date: new Date(r.created_at).toLocaleDateString(),
    members: 0, // You can fetch member count if needed
    amount: (r.receipt_items || []).reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0),
  }));

  res.status(200).json({ bills });
}

interface TeamMember {
  team_id: string;
}
