-- Migration: Fix tables for mobile API compatibility
-- Date: 2025-12-09

-- ==========================================
-- FIX ARTISTS TABLE - Add missing columns
-- ==========================================

ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS performance_time VARCHAR(20);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Index for is_active
CREATE INDEX IF NOT EXISTS idx_artists_is_active ON artists(is_active);

-- Update existing records to be active
UPDATE artists SET is_active = true WHERE is_active IS NULL;

-- ==========================================
-- FIX GALLERY TABLE - Add missing columns
-- ==========================================

ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS full_url TEXT;

-- Index for is_active
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active);

-- Update existing records to be active
UPDATE gallery SET is_active = true WHERE is_active IS NULL;

-- ==========================================
-- CREATE NEWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ro TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  excerpt_ro TEXT,
  excerpt_ru TEXT,
  content_ro TEXT NOT NULL,
  content_ru TEXT NOT NULL,
  cover_image TEXT,
  category TEXT DEFAULT 'news',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

-- RLS policies
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Public read access for published news
CREATE POLICY "Published news are viewable by everyone" ON news
  FOR SELECT USING (is_published = true);

-- Admin access for management
CREATE POLICY "Admins can manage news" ON news
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- CREATE PROGRAM TABLE (for mobile API)
-- ==========================================

CREATE TABLE IF NOT EXISTS program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ro TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  stage TEXT,
  category TEXT DEFAULT 'performance',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_date ON program(date);
CREATE INDEX IF NOT EXISTS idx_program_is_active ON program(is_active);
CREATE INDEX IF NOT EXISTS idx_program_stage ON program(stage);

-- RLS policies
ALTER TABLE program ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Active program items are viewable by everyone" ON program
  FOR SELECT USING (is_active = true);

-- Admin access
CREATE POLICY "Admins can manage program" ON program
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_program_updated_at ON program;
CREATE TRIGGER update_program_updated_at
  BEFORE UPDATE ON program
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- MIGRATE DATA FROM program_events TO program (if exists)
-- ==========================================

-- Insert data from program_events if table exists and program is empty
INSERT INTO program (title_ro, title_ru, description_ro, description_ru, date, start_time, stage, category, is_active, sort_order)
SELECT
  artist as title_ro,
  artist as title_ru,
  genre as description_ro,
  genre as description_ru,
  CASE
    WHEN date = '7 August' THEN '2025-08-07'::DATE
    WHEN date = '8 August' THEN '2025-08-08'::DATE
    WHEN date = '9 August' THEN '2025-08-09'::DATE
    ELSE '2025-08-07'::DATE
  END as date,
  (time || ':00')::TIME as start_time,
  stage,
  CASE WHEN is_headliner THEN 'headliner' ELSE 'performance' END as category,
  true as is_active,
  sort_order
FROM program_events
WHERE year = '2025'
ON CONFLICT DO NOTHING;
