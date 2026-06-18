/*
# Deep Carbon (Глибини Карбонації) — Full Database Schema

## Summary
Creates all tables required for the Deep Carbon mining simulator Telegram Mini App.

## New Tables

### 1. users
Stores Telegram user profiles, language preferences, and play time tracking.
- id: UUID primary key
- telegram_id: unique Telegram user ID (BIGINT)
- first_name, last_name, username, photo_url: from Telegram profile
- language: 'uk' (Ukrainian, default) or 'en' (English)
- total_play_time_seconds: cumulative active play time
- current_session_start: timestamp when current session began
- created_at, last_login: timestamps

### 2. game_progress
Per-user game state (layer, balance, digs, upgrades, daily rewards).
- user_id: FK → users.id
- current_layer: current mine depth (1–100)
- total_digs: lifetime dig count
- carbonance_balance: in-game currency
- tool_level: 1=Shovel, 2=Pickaxe, 3=Jackhammer, 4=Drill
- helper_count: hired passive income workers
- passive_income_rate: Carbonance per hour
- daily_claim_time: last daily reward timestamp
- daily_streak: consecutive daily claim count

### 3. story_progress
Tracks which story acts and journal pages a user has unlocked.
- user_id: FK → users.id
- act_reached: highest act number unlocked (0–5)
- journal_pages_found: JSONB array of page IDs
- last_page_viewed: last journal page ID viewed

### 4. resources_inventory
Per-user inventory of mined resources.
- user_id: FK → users.id
- resource_type: one of (iron, glass, fossils, quartz, diamond, obsidian, artifact)
- quantity: count owned
- Composite PK: (user_id, resource_type)

### 5. transactions
Audit log of all economy events per user.
- id: UUID PK
- user_id: FK → users.id
- type: earn | spend | ad_reward | purchase | referral | daily_reward
- amount: Carbonance delta (positive = earn, negative = spend)
- description: bilingual JSON {en, uk}
- created_at: timestamp

### 6. referrals
Tracks who referred whom and whether rewards were claimed.
- id: UUID PK
- referrer_id: FK → users.id (the inviter)
- referred_id: FK → users.id (the new player), UNIQUE
- reward_claimed: whether the referrer received their reward
- created_at: timestamp

### 7. play_sessions
Detailed per-session analytics.
- id: UUID PK
- user_id: FK → users.id
- session_start, session_end: timestamps
- session_duration_seconds: computed session length
- digs_performed: digs in this session
- carbonance_earned: currency earned this session

## Security
- RLS enabled on all tables.
- All policies use anon + authenticated roles (Telegram auth is custom/JWT-based,
  so we use anon key with service-role for server-side writes).
- Backend Edge Function uses service_role key to bypass RLS for trusted writes.
*/

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  language TEXT NOT NULL DEFAULT 'uk',
  total_play_time_seconds BIGINT NOT NULL DEFAULT 0,
  current_session_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- GAME PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_layer INTEGER NOT NULL DEFAULT 1,
  total_digs INTEGER NOT NULL DEFAULT 0,
  carbonance_balance BIGINT NOT NULL DEFAULT 0,
  tool_level INTEGER NOT NULL DEFAULT 1,
  helper_count INTEGER NOT NULL DEFAULT 0,
  passive_income_rate INTEGER NOT NULL DEFAULT 0,
  daily_claim_time TIMESTAMPTZ,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_game_progress" ON game_progress;
CREATE POLICY "anon_select_game_progress" ON game_progress FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_game_progress" ON game_progress;
CREATE POLICY "anon_insert_game_progress" ON game_progress FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_game_progress" ON game_progress;
CREATE POLICY "anon_update_game_progress" ON game_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_game_progress" ON game_progress;
CREATE POLICY "anon_delete_game_progress" ON game_progress FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- STORY PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS story_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  act_reached INTEGER NOT NULL DEFAULT 0,
  journal_pages_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_page_viewed INTEGER,
  UNIQUE (user_id)
);

ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_story_progress" ON story_progress;
CREATE POLICY "anon_select_story_progress" ON story_progress FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_story_progress" ON story_progress;
CREATE POLICY "anon_insert_story_progress" ON story_progress FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_story_progress" ON story_progress;
CREATE POLICY "anon_update_story_progress" ON story_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_story_progress" ON story_progress;
CREATE POLICY "anon_delete_story_progress" ON story_progress FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- RESOURCES INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS resources_inventory (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('iron', 'glass', 'fossils', 'quartz', 'diamond', 'obsidian', 'artifact')),
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, resource_type)
);

ALTER TABLE resources_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resources" ON resources_inventory;
CREATE POLICY "anon_select_resources" ON resources_inventory FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resources" ON resources_inventory;
CREATE POLICY "anon_insert_resources" ON resources_inventory FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resources" ON resources_inventory;
CREATE POLICY "anon_update_resources" ON resources_inventory FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resources" ON resources_inventory;
CREATE POLICY "anon_delete_resources" ON resources_inventory FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'ad_reward', 'purchase', 'referral', 'daily_reward')),
  amount INTEGER NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id),
  referred_id uuid NOT NULL UNIQUE REFERENCES users(id),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
CREATE POLICY "anon_select_referrals" ON referrals FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
CREATE POLICY "anon_insert_referrals" ON referrals FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
CREATE POLICY "anon_update_referrals" ON referrals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_referrals" ON referrals;
CREATE POLICY "anon_delete_referrals" ON referrals FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- PLAY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS play_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_end TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  digs_performed INTEGER NOT NULL DEFAULT 0,
  carbonance_earned INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS play_sessions_user_id_idx ON play_sessions(user_id);

ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_play_sessions" ON play_sessions;
CREATE POLICY "anon_select_play_sessions" ON play_sessions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_play_sessions" ON play_sessions;
CREATE POLICY "anon_insert_play_sessions" ON play_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_play_sessions" ON play_sessions;
CREATE POLICY "anon_update_play_sessions" ON play_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_play_sessions" ON play_sessions;
CREATE POLICY "anon_delete_play_sessions" ON play_sessions FOR DELETE TO anon, authenticated USING (true);
