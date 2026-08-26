-- ==============================================================================
-- 🛡️ PICKMYBALL — SUPABASE SECURITY & ROW LEVEL SECURITY (RLS) SETUP
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/wuewvkstwjljvbgiogez
-- 2. Go to the "SQL Editor" on the left sidebar.
-- 3. Click "New Query", paste this entire file, and click "Run".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE SECURITY & INTEGRITY
-- ------------------------------------------------------------------------------

-- Ensure profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 25),
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0),
  rank TEXT NOT NULL DEFAULT 'Rookie',
  wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
  battles INTEGER NOT NULL DEFAULT 0 CHECK (battles >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  highest_rating INTEGER NOT NULL DEFAULT 0 CHECK (highest_rating >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- #4: Enable Row-Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- #7: Lock Record Access Policies
-- Anyone can view player profiles (leaderboards, lobbies, match history)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Authenticated user can create their own profile matching auth.uid()
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can only modify their own profile data
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ------------------------------------------------------------------------------
-- 2. MATCHES TABLE SECURITY & INTEGRITY
-- ------------------------------------------------------------------------------

-- Ensure matches table exists with proper structure
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  host_avatar TEXT,
  match_type TEXT NOT NULL CHECK (match_type IN ('1v1', '2v2')),
  game_format TEXT NOT NULL CHECK (game_format IN ('single_11', 'single_15', 'single_21', 'best_of_3')),
  target_points INTEGER NOT NULL DEFAULT 11 CHECK (target_points IN (11, 15, 21)),
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'LIVE', 'COMPLETED', 'CANCELLED')),
  team_a JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_b JSONB NOT NULL DEFAULT '[]'::jsonb,
  referee_id UUID REFERENCES auth.users(id),
  referee JSONB,
  current_game INTEGER NOT NULL DEFAULT 1 CHECK (current_game >= 1),
  team_a_score INTEGER NOT NULL DEFAULT 0 CHECK (team_a_score >= 0),
  team_b_score INTEGER NOT NULL DEFAULT 0 CHECK (team_b_score >= 0),
  team_a_games_won INTEGER NOT NULL DEFAULT 0 CHECK (team_a_games_won >= 0),
  team_b_games_won INTEGER NOT NULL DEFAULT 0 CHECK (team_b_games_won >= 0),
  serving_team TEXT NOT NULL DEFAULT 'A' CHECK (serving_team IN ('A', 'B')),
  server_number INTEGER NOT NULL DEFAULT 2 CHECK (server_number IN (1, 2)),
  game_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  match_winner TEXT NOT NULL DEFAULT 'NONE' CHECK (match_winner IN ('NONE', 'TEAM_A', 'TEAM_B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- #4: Enable Row-Level Security (RLS)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Matches are viewable by all authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Hosts and players can update matches" ON public.matches;

-- #7: Lock Record Access Policies
CREATE POLICY "Matches are viewable by all authenticated users"
ON public.matches
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Authenticated users can create matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts and players can update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (
  -- Host or referee can update
  auth.uid() = host_id OR 
  auth.uid() = referee_id OR
  -- Or any player in team_a / team_b can join/update
  team_a @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)) OR
  team_b @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)) OR
  status = 'WAITING'
);


-- ------------------------------------------------------------------------------
-- 3. #16: STORAGE SECURITY — AVATARS BUCKET
-- ------------------------------------------------------------------------------
-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2621440, -- 2.5MB maximum upload limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2621440,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS Policies for avatars
CREATE POLICY "Public Avatar Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update/delete their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- 🚀 DONE! All RLS policies, table constraints, and upload limits are active.
-- ==============================================================================
