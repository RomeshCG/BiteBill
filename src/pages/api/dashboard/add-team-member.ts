import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { team_id, email, invited_by } = req.body;
  if (!team_id || !email || !invited_by) {
    return res.status(400).json({ error: 'Missing data' });
  }

  // Check if invite already exists and is pending
  const { data: existing, error: existingError } = await supabase
    .from('team_invites')
    .select('id, accepted')
    .eq('team_id', team_id)
    .eq('email', email)
    .is('accepted', null)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ error: 'Failed to check existing invites' });
  }

  if (existing) {
    return res.status(400).json({ error: 'Invite already pending for this email' });
  }

  // Create invite
  const { error } = await supabase
    .from('team_invites')
    .insert({ team_id, email, invited_by, accepted: null });

  if (error) {
    return res.status(500).json({ error: 'Failed to create invite' });
  }

  return res.status(200).json({ message: 'Invite sent successfully' });
}
