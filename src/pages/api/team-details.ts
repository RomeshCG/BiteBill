// This API route returns details for a specific team, including team info, members, and bill history.
import { supabase } from '../../../lib/supabase';

import type { NextApiRequest, NextApiResponse } from 'next';

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

  // Fetch team members with join date and profile
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('user_id, joined_at, profiles(full_name)')
    .eq('team_id', teamId);
  if (membersError) return res.status(500).json({ error: 'Failed to fetch members' });

  // Fetch team bill history (receipts)
  const { data: receipts, error: receiptsError } = await supabase
    .from('receipts')
    .select('id, title, created_at, created_by')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  if (receiptsError) return res.status(500).json({ error: 'Failed to fetch receipts' });

  res.status(200).json({ team, members, receipts });
}
