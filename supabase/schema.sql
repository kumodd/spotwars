-- InternetBillboard.space Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BOARDS
-- ============================================================
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('global', 'category', 'geo', 'stage', 'theme')),
  category TEXT,
  entry_fee INTEGER NOT NULL DEFAULT 49, -- in paise (₹49 = 4900)
  min_overtake_increment INTEGER NOT NULL DEFAULT 100, -- in paise (₹1 = 100)
  max_positions INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed global board
INSERT INTO boards (name, slug, type, entry_fee, description, icon)
VALUES ('Global Board', 'global', 'global', 4900, 'The main competitive arena — all products battle for global attention.', '🌐');

INSERT INTO boards (name, slug, type, category, entry_fee, description, icon)
VALUES 
  ('AI & ML', 'ai-ml', 'category', 'AI & ML', 4900, 'Artificial intelligence, machine learning, and automation products.', '🤖'),
  ('SaaS', 'saas', 'category', 'SaaS', 4900, 'Software-as-a-service tools and platforms.', '☁️'),
  ('Developer Tools', 'dev-tools', 'category', 'Developer Tools', 4900, 'Tools built by developers, for developers.', '🛠️'),
  ('E-commerce', 'ecommerce', 'category', 'E-commerce', 4900, 'Online stores, D2C brands, and retail tech.', '🛒'),
  ('Fintech', 'fintech', 'category', 'Fintech', 4900, 'Financial technology, payments, and banking.', '💰'),
  ('Education', 'education', 'category', 'Education', 4900, 'EdTech, learning platforms, and courses.', '🎓'),
  ('Consumer Apps', 'consumer-apps', 'category', 'Consumer Apps', 4900, 'Consumer-facing apps and mobile products.', '📱'),
  ('Creator Tools', 'creator-tools', 'category', 'Creator Tools', 4900, 'Tools for content creators and media makers.', '🎨');

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  tagline TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'IN',
  pricing TEXT NOT NULL DEFAULT 'Free',
  tags TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  founder_name TEXT,
  company_name TEXT,
  total_spend INTEGER NOT NULL DEFAULT 0, -- cumulative in paise
  click_count INTEGER NOT NULL DEFAULT 0,
  impression_count INTEGER NOT NULL DEFAULT 0,
  spot_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  momentum_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'banned')),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOARD POSITIONS
-- ============================================================
CREATE TABLE board_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  spend_on_board INTEGER NOT NULL DEFAULT 0, -- cumulative spend on THIS board, in paise
  previous_position INTEGER,
  position_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, board_id)
);

CREATE INDEX idx_board_positions_board ON board_positions(board_id, position);
CREATE INDEX idx_board_positions_product ON board_positions(product_id);

-- ============================================================
-- BIDS (payment records)
-- ============================================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  founder_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL, -- in paise
  type TEXT NOT NULL CHECK (type IN ('entry', 'attack', 'defense', 'boost')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  position_before INTEGER,
  position_after INTEGER,
  target_product_id UUID REFERENCES products(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX idx_bids_product ON bids(product_id, status);
CREATE INDEX idx_bids_razorpay ON bids(razorpay_order_id);

-- ============================================================
-- ACTIVITY EVENTS (live feed)
-- ============================================================
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'product_entered', 'overtake', 'defense', 'milestone_clicks',
    'milestone_spend', 'reached_top10', 'reached_top3', 'reached_number1',
    'trending', 'fastest_riser', 'battle_started', 'battle_ended'
  )),
  board_id UUID REFERENCES boards(id),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_events_board ON activity_events(board_id, created_at DESC);
CREATE INDEX idx_activity_events_product ON activity_events(product_id, created_at DESC);

-- ============================================================
-- PRODUCT CLICKS
-- ============================================================
CREATE TABLE product_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_hash TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON product_clicks(product_id, created_at DESC);

-- ============================================================
-- PRODUCT IMPRESSIONS
-- ============================================================
CREATE TABLE product_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  session_id TEXT,
  board_id UUID REFERENCES boards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_impressions_product ON product_impressions(product_id, created_at DESC);

-- ============================================================
-- USER PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  twitter TEXT,
  linkedin TEXT,
  role TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('founder', 'admin', 'moderator')),
  spot_points INTEGER NOT NULL DEFAULT 0,
  prediction_rating NUMERIC(6,2) NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DAILY SPEND SNAPSHOTS (for charts)
-- ============================================================
CREATE TABLE daily_spend_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  UNIQUE(product_id, board_id, date)
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Recalculate board positions atomically after a bid is confirmed
CREATE OR REPLACE FUNCTION recalculate_board_positions(p_board_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update positions based on spend_on_board descending
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY spend_on_board DESC, entered_at ASC) AS new_position
    FROM board_positions
    WHERE board_id = p_board_id
  )
  UPDATE board_positions bp
  SET
    previous_position = bp.position,
    position = ranked.new_position,
    position_changed_at = CASE WHEN bp.position != ranked.new_position THEN NOW() ELSE bp.position_changed_at END
  FROM ranked
  WHERE bp.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- Add a bid and update board (called after payment verified)
CREATE OR REPLACE FUNCTION apply_bid(
  p_bid_id UUID,
  p_product_id UUID,
  p_board_id UUID,
  p_amount INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_old_position INTEGER;
  v_new_position INTEGER;
  v_target_product_id UUID;
  v_target_name TEXT;
BEGIN
  -- Get old position
  SELECT position INTO v_old_position
  FROM board_positions
  WHERE product_id = p_product_id AND board_id = p_board_id;

  -- Get what product is currently at old_position - 1 (potential overtake target)
  SELECT bp.product_id, p.name INTO v_target_product_id, v_target_name
  FROM board_positions bp
  JOIN products p ON p.id = bp.product_id
  WHERE bp.board_id = p_board_id AND bp.position = v_old_position - 1
  LIMIT 1;

  -- Update spend on board
  UPDATE board_positions
  SET spend_on_board = spend_on_board + p_amount
  WHERE product_id = p_product_id AND board_id = p_board_id;

  -- Update total product spend
  UPDATE products
  SET total_spend = total_spend + p_amount
  WHERE id = p_product_id;

  -- Recalculate all positions
  PERFORM recalculate_board_positions(p_board_id);

  -- Get new position
  SELECT position INTO v_new_position
  FROM board_positions
  WHERE product_id = p_product_id AND board_id = p_board_id;

  -- Update bid record
  UPDATE bids
  SET position_before = v_old_position, position_after = v_new_position, status = 'paid', verified_at = NOW()
  WHERE id = p_bid_id;

  RETURN jsonb_build_object(
    'old_position', v_old_position,
    'new_position', v_new_position,
    'overtook_product_id', v_target_product_id,
    'overtook_product_name', v_target_name
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spend_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: active products are public; founders can manage own
CREATE POLICY "Active products are publicly readable" ON products FOR SELECT USING (status = 'active' OR founder_id = auth.uid());
CREATE POLICY "Founders can create products" ON products FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Founders can update own products" ON products FOR UPDATE USING (auth.uid() = founder_id);

-- Board positions: publicly readable
CREATE POLICY "Board positions are publicly readable" ON board_positions FOR SELECT USING (true);
CREATE POLICY "Service role can manage board positions" ON board_positions FOR ALL USING (auth.role() = 'service_role');

-- Bids: founders can see own bids; service role manages all
CREATE POLICY "Founders can view own bids" ON bids FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Founders can create bids" ON bids FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Service role can manage bids" ON bids FOR ALL USING (auth.role() = 'service_role');

-- Activity events: public
CREATE POLICY "Activity events are publicly readable" ON activity_events FOR SELECT USING (is_public = true);
CREATE POLICY "Service role can create activity events" ON activity_events FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Clicks/Impressions: insertable by anyone, readable by service role
CREATE POLICY "Anyone can log clicks" ON product_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads clicks" ON product_clicks FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can log impressions" ON product_impressions FOR INSERT WITH CHECK (true);

-- Daily snapshots: readable by product owners
CREATE POLICY "Founders can read own snapshots" ON daily_spend_snapshots FOR SELECT USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.founder_id = auth.uid())
);
CREATE POLICY "Service role manages snapshots" ON daily_spend_snapshots FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- REALTIME: enable on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE board_positions;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_events;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
