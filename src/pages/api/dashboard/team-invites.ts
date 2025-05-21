import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

// GET: List pending invites for the logged-in user
// POST: Accept or reject an invite (by invite id, with an `accept` boolean)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get user email from query or session (for demo, from query)
    const { email } = req.query;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Missing email' });
    // Fetch invites and join with teams to get team name
    const { data: invites, error } = await supabase
      .from('team_invites')
      .select('*, team:teams(name)')
      .eq('email', email)
      .is('accepted', null); // Use .is for nullable boolean
    if (error) {
      console.error('Error fetching invites:', error);
      return res.status(500).json({ error: 'Failed to fetch invites', details: error.message });
    }
    // Map team name to top-level property for easier frontend use
    const invitesWithTeamName = (invites || []).map(invite => ({
      ...invite,
      team_name: invite.team?.name || invite.team_id
    }));
    return res.status(200).json({ invites: invitesWithTeamName });
  }
  if (req.method === 'POST') {
    const { invite_id, accept, user_id } = req.body;
    if (!invite_id || typeof accept !== 'boolean' || !user_id) return res.status(400).json({ error: 'Missing data' });
    // Get invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('id', invite_id)
      .single();
    if (inviteError || !invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.accepted !== null) return res.status(400).json({ error: 'Invite already handled' });
    // Update invite
    const { error: updateError } = await supabase
      .from('team_invites')
      .update({ accepted: accept })
      .eq('id', invite_id);
    if (updateError) return res.status(500).json({ error: 'Failed to update invite' });
    // If accepted, add to team_members
    if (accept) {
      const { error: addError } = await supabase
        .from('team_members')
        .insert({ team_id: invite.team_id, user_id });
      if (addError) return res.status(500).json({ error: 'Failed to add to team' });
    }
    return res.status(200).json({ message: accept ? 'Invite accepted' : 'Invite rejected' });
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
