import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();

  const {
    receipt_id,
    user_id, // the user making the request
    title,
    amount,
    date,
    splits, // array of { user_id, amount_owed }
    payments // array of { user_id, amount_paid }
  } = req.body;

  if (!receipt_id || !user_id || !title || !amount || !date || !Array.isArray(splits) || !Array.isArray(payments)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Check if user is the bill creator or a payer
  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .select("created_by")
    .eq("id", receipt_id)
    .single();
  if (receiptError) return res.status(500).json({ error: receiptError.message });

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("user_id")
    .eq("receipt_id", receipt_id)
    .eq("user_id", user_id)
    .maybeSingle();
  if (paymentError) return res.status(500).json({ error: paymentError.message });

  if (receipt.created_by !== user_id && !payment) {
    return res.status(403).json({ error: "Not allowed to edit this bill." });
  }

  // Update receipts
  const { error: updateError } = await supabase
    .from("receipts")
    .update({ title, created_at: date })
    .eq("id", receipt_id);
  if (updateError) return res.status(500).json({ error: updateError.message });

  // Update receipt_items (optional, if you use it)
  await supabase
    .from("receipt_items")
    .update({ name: title, amount, created_at: date })
    .eq("receipt_id", receipt_id);

  // Delete old splits and insert new
  await supabase.from("splits").delete().eq("receipt_id", receipt_id);
  const splitsToInsert = splits.map((s: any) => ({
    receipt_id,
    user_id: s.user_id,
    amount_owed: s.amount_owed,
  }));
  const { error: splitsError } = await supabase.from("splits").insert(splitsToInsert);
  if (splitsError) return res.status(500).json({ error: splitsError.message });

  // Delete old payments and insert new
  await supabase.from("payments").delete().eq("receipt_id", receipt_id);
  if (Array.isArray(payments) && payments.length > 0) {
    const paymentsToInsert = payments.map((p: any) => ({
      receipt_id,
      user_id: p.user_id,
      amount_paid: p.amount_paid,
    }));
    const { error: paymentsError } = await supabase.from("payments").insert(paymentsToInsert);
    if (paymentsError) return res.status(500).json({ error: paymentsError.message });
  }

  res.status(200).json({ success: true });
} 