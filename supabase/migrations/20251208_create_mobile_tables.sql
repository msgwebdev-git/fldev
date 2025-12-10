-- Migration: Create tables for mobile app support
-- Date: 2025-12-08

-- ==========================================
-- DEVICE TOKENS (Push Notifications)
-- ==========================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  language TEXT DEFAULT 'ro' CHECK (language IN ('ro', 'ru')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_device_tokens_language ON device_tokens(language);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(is_active);

-- RLS policies
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Allow insert/update from server (service role)
CREATE POLICY "Service role can manage device tokens" ON device_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- FAQ TABLE (if not exists)
-- ==========================================

CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ro TEXT NOT NULL,
  question_ru TEXT NOT NULL,
  answer_ro TEXT NOT NULL,
  answer_ru TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);

-- RLS policies
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read active FAQ" ON faq
  FOR SELECT USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage FAQ" ON faq
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- ==========================================
-- APP VERSIONS TABLE (for force update checks)
-- ==========================================

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  latest_version TEXT NOT NULL,
  min_version TEXT NOT NULL,
  update_url TEXT NOT NULL,
  release_notes_ro TEXT,
  release_notes_ru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform)
);

-- Insert default versions
INSERT INTO app_versions (platform, latest_version, min_version, update_url)
VALUES
  ('ios', '1.0.0', '1.0.0', 'https://apps.apple.com/app/fl-festival/id123456789'),
  ('android', '1.0.0', '1.0.0', 'https://play.google.com/store/apps/details?id=md.flfestival.app')
ON CONFLICT (platform) DO NOTHING;

-- RLS policies
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read app versions" ON app_versions
  FOR SELECT USING (true);

-- ==========================================
-- PUSH NOTIFICATIONS LOG
-- ==========================================

CREATE TABLE IF NOT EXISTS push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  target_platform TEXT CHECK (target_platform IN ('ios', 'android', 'all')),
  target_language TEXT CHECK (target_language IN ('ro', 'ru', 'all')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_at ON push_notifications_log(sent_at);

-- RLS policies
ALTER TABLE push_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage push notifications" ON push_notifications_log
  FOR ALL USING (true);

-- ==========================================
-- UPDATE TIMESTAMP TRIGGERS
-- ==========================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_device_tokens_updated_at ON device_tokens;
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faq_updated_at ON faq;
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_versions_updated_at ON app_versions;
CREATE TRIGGER update_app_versions_updated_at
  BEFORE UPDATE ON app_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
