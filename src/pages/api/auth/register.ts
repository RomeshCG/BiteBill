import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  // Sign up user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  if (error) return res.status(400).json({ error: error.message });

  // Upsert profile row for this user after registration
  const user = data.user;
  if (user) {
    await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      full_name: full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url || null,
      email: user.email,
    }, { onConflict: 'id' });
  }

  res.status(200).json({ user: data.user });
}
