// This API route returns details for a specific
import { supabase } from '../../../lib/supabase';

import type { NextApiRequest, NextApiResponse } from 'next';

/*
  Fix for Supabase join: use the correct foreign key join notation for the profiles table.
  The join should be: profiles!user_id(full_name)
  This matches team_members.user_id to profiles.id
*/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: 'Missing teamId' });

  // Fetch team info
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name, created_at, created_by')
    .eq('id', teamId)
    .single();
  if (teamError || !team) return res.status(404).json({ error: 'Team not found' });

  // Fetch team members with join date and is_removed
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('user_id, joined_at, is_removed, removed_at')
    .eq('team_id', teamId);
  if (membersError) return res.status(500).json({ error: 'Failed to fetch members' });

  // Fetch profiles for all user_ids (ensure userIds is not empty)
  const userIds = (members || []).map((m) => m.user_id);
  let profilesMap: Record<string, { full_name: string }> = {};
  if (userIds.length > 0) {
    const userIdsStr = userIds.map((id) => String(id));
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIdsStr);
    if (profilesError) {
      return res.status(500).json({ error: 'Failed to fetch profiles' });
    }
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, { full_name: p.full_name }]));
    }
  }
  // Attach full_name to each member
  const membersWithNames = (members || []).map((m) => ({
    ...m,
    full_name: profilesMap[m.user_id]?.full_name || m.user_id,
  }));

  // Fetch team bill history (receipts)
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts')
    .select('id, title, created_at, created_by')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  if (receiptsError) return res.status(500).json({ error: 'Failed to fetch receipts' });

  // Fetch splits for all receipts (bill history)
  const receiptIds = (receipts || []).map((r) => r.id);
  let splitsMap: Record<string, any[]> = {};
  if (receiptIds.length > 0) {
    const { data: splits, error: splitsError } = await supabase
      .from('splits')
      .select('id, receipt_id, user_id, amount_owed, is_removed')
      .in('receipt_id', receiptIds);
    if (!splitsError && splits) {
      splitsMap = receiptIds.reduce((acc, rid) => {
        acc[rid] = splits.filter((s) => s.receipt_id === rid);
        return acc;
      }, {} as Record<string, any[]>);
    }
  }
  // Attach splits to each receipt
  const receiptsWithSplits = (receipts || []).map((r) => ({
    ...r,
    splits: splitsMap[r.id] || [],
  }));

  res.status(200).json({ team, members: membersWithNames, receipts: receiptsWithSplits });
}
