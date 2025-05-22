import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { team_id, user_id, removed_by } = req.body;
  if (!team_id || !user_id || !removed_by) {
    return res.status(400).json({ error: 'Missing data' });
  }

  // First verify that the person removing is the team creator
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('created_by')
    .eq('id', team_id)
    .single();

  if (teamError) {
    return res.status(500).json({ error: 'Failed to verify team ownership' });
  }

  if (team.created_by !== removed_by) {
    return res.status(403).json({ error: 'Only team creator can remove members' });
  }

  // Start a transaction to handle both member removal and bill updates
  const { error: transactionError } = await supabase.rpc('remove_team_member', {
    p_team_id: team_id,
    p_user_id: user_id
  });

  if (transactionError) {
    return res.status(500).json({ error: 'Failed to remove team member' });
  }

  return res.status(200).json({ message: 'Team member removed successfully' });
} 