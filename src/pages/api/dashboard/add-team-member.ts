import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { team_id, email, invited_by } = req.body;
  if (!team_id || !email || !invited_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    return res.status(500).json({ error: userError.message });
  }

  if (user) {
    // Add to team_members
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id, user_id: user.id });
    if (memberError) {
      return res.status(500).json({ error: memberError.message });
    }
    return res.status(200).json({ message: 'User added to team' });
  } else {
    // Create invite
    const { error: inviteError } = await supabase
      .from('team_invites')
      .insert({ team_id, email, invited_by, invited_at: new Date().toISOString(), accepted: false });
    if (inviteError) {
      return res.status(500).json({ error: inviteError.message });
    }
    return res.status(200).json({ message: 'Invite sent' });
  }
}
