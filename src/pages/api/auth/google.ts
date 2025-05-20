import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { redirectTo } = req.body;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || undefined,
    },
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ url: data.url });
}

// After Google OAuth, upsert a profile row for the user (if you handle the callback here)
// If you use a Supabase callback URL, ensure the profile is upserted after OAuth login in your app logic.
