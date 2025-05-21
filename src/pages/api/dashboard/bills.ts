import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, filter } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  let bills = [];

  if (filter === "paid") {
    // Bills where user is a payer (in payments)
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("receipt_id, amount_paid")
      .eq("user_id", user_id);
    if (paymentsError) return res.status(500).json({ error: paymentsError.message });
    const receiptIds = (payments || []).map((p: any) => p.receipt_id);
    if (receiptIds.length === 0) return res.status(200).json({ bills: [] });
    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("id, team_id, title, created_at, team:teams(name), receipt_items(amount)")
      .in("id", receiptIds)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    // Map receipt_id to amount_paid
    const amountPaidMap: Record<string, number> = {};
    (payments || []).forEach((p: any) => { amountPaidMap[String(p.receipt_id)] = p.amount_paid; });
    bills = (receipts || []).map((r: any) => ({
      team: r.team?.[0]?.name || "",
      date: new Date(r.created_at).toLocaleDateString(),
      members: 0,
      amount: amountPaidMap[String(r.id)] || 0, // user's paid amount
      title: r.title,
      id: r.id,
    }));
  } else if (filter === "owe") {
    // Bills where user owes money (in splits), but is NOT a payer
    const { data: splits, error: splitsError } = await supabase
      .from("splits")
      .select("receipt_id, amount_owed")
      .eq("user_id", user_id)
      .gt("amount_owed", 0);
    if (splitsError) return res.status(500).json({ error: splitsError.message });
    const receiptIds = (splits || []).map((s: any) => s.receipt_id);
    if (receiptIds.length === 0) return res.status(200).json({ bills: [] });
    // Exclude receipts where user is a payer
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("receipt_id")
      .eq("user_id", user_id);
    if (paymentsError) return res.status(500).json({ error: paymentsError.message });
    const paidReceiptIds = new Set((payments || []).map((p: any) => String(p.receipt_id)));
    const filteredReceiptIds = receiptIds.filter((id: any) => !paidReceiptIds.has(String(id)));
    if (filteredReceiptIds.length === 0) return res.status(200).json({ bills: [] });
    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("id, team_id, title, created_at, team:teams(name)")
      .in("id", filteredReceiptIds)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    // Map receipt_id to amount_owed
    const amountOwedMap: Record<string, number> = {};
    (splits || []).forEach((s: any) => { amountOwedMap[String(s.receipt_id)] = s.amount_owed; });
    bills = (receipts || []).map((r: any) => ({
      team: r.team?.[0]?.name || "",
      date: new Date(r.created_at).toLocaleDateString(),
      members: 0,
      amount: amountOwedMap[String(r.id)] || 0, // user's share
      title: r.title,
      id: r.id,
    }));
  } else {
    // All bills for teams the user is in
    const { data: teamMembers, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user_id);
    if (teamError) return res.status(500).json({ error: teamError.message });
    const teamIds = (teamMembers || []).map((tm: any) => tm.team_id);
    if (teamIds.length === 0) return res.status(200).json({ bills: [] });
    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("id, team_id, title, created_at, team:teams(name), receipt_items(amount)")
      .in("team_id", teamIds)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    bills = (receipts || []).map((r: any) => ({
      team: r.team?.[0]?.name || "",
      date: new Date(r.created_at).toLocaleDateString(),
      members: 0,
      amount: (r.receipt_items || []).reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0),
      title: r.title,
      id: r.id,
    }));
  }

  res.status(200).json({ bills });
}

interface TeamMember {
  team_id: string;
}
