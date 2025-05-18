import type { NextApiRequest, NextApiResponse } from 'next';
// Update the import path below if your supabase client is in a different location
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Try to fetch from a test table (replace 'test_table' with your actual table name)
  const { data, error } = await supabase.from('test_table').select('*').limit(1);

  if (error) {
    return res.status(500).json({ connected: false, error: error.message });
  }
  return res.status(200).json({ connected: true, data });
}
