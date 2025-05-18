import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

interface ReceiptItem {
  name: string;
  amount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { team_id, created_by, title, items } = req.body;
  if (!team_id || !created_by || !title || !Array.isArray(items))
    return res.status(400).json({ error: "Missing fields" });

  const { data: receipt, error } = await supabase
    .from("receipts")
    .insert([{ team_id, created_by, title }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Insert items
  const itemsWithReceipt = (items as ReceiptItem[]).map((item) => ({
    ...item,
    receipt_id: receipt.id,
  }));
  await supabase.from("receipt_items").insert(itemsWithReceipt);

  res.status(200).json({ receipt });
}