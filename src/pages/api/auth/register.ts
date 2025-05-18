import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

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

  res.status(200).json({ user: data.user });
}
