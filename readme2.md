-- Users are managed by Supabase Auth, but you can store extra profile info if needed
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Teams table
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Team members (many-to-many: users <-> teams)
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  unique (team_id, user_id)
);

-- Receipts (bills)
create table receipts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  created_by uuid references profiles(id),
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Receipt items (each item on a bill)
create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete cascade,
  name text not null,
  amount numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Splits (who owes what for each receipt)
create table splits (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete cascade,
  user_id uuid references profiles(id),
  amount_owed numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Optional: Invite tokens for joining teams
create table team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  email text,
  token text,
  invited_at timestamp with time zone default timezone('utc'::text, now()),
  accepted boolean default false
);