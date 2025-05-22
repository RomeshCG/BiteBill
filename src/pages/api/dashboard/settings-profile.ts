import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (error) throw error;

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
