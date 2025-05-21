import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    team_id,
    created_by, // user id
    title,
    amount,
    date,
    members, // array of user ids
    split_type, // 'equal' | 'custom' | 'percent'
    splits, // array of { user_id, amount_owed }
    payments // array of { user_id, amount_paid }
  } = req.body;

  if (!team_id || !created_by || !title || !amount || !date || !Array.isArray(members) || !split_type || !Array.isArray(splits)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Check if user is the team creator
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("created_by")
    .eq("id", team_id)
    .single();
  if (teamError) return res.status(500).json({ error: teamError.message });
  if (!team || team.created_by !== created_by) {
    return res.status(403).json({ error: "Only the team creator can add a bill." });
  }

  // Insert into receipts
  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .insert([{ team_id, created_by, title, created_at: date }])
    .select()
    .single();
  if (receiptError) return res.status(500).json({ error: receiptError.message });

  // Insert into splits
  const splitsToInsert = splits.map((s: any) => ({
    receipt_id: receipt.id,
    user_id: s.user_id,
    amount_owed: s.amount_owed,
  }));
  const { error: splitsError } = await supabase.from("splits").insert(splitsToInsert);
  if (splitsError) return res.status(500).json({ error: splitsError.message });

  // Optionally, insert into receipt_items if you want to store the bill as a single item
  const { error: itemError } = await supabase.from("receipt_items").insert([
    {
      receipt_id: receipt.id,
      name: title,
      amount: amount,
      created_at: date,
    },
  ]);
  if (itemError) return res.status(500).json({ error: itemError.message });

  // Insert into payments
  if (Array.isArray(payments) && payments.length > 0) {
    const paymentsToInsert = payments.map((p: any) => ({
      receipt_id: receipt.id,
      user_id: p.user_id,
      amount_paid: p.amount_paid,
    }));
    const { error: paymentsError } = await supabase.from("payments").insert(paymentsToInsert);
    if (paymentsError) return res.status(500).json({ error: paymentsError.message });
  }

  res.status(200).json({ receipt });
}
