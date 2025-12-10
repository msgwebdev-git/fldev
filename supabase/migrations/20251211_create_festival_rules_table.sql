-- Create festival_rules table with multilingual support
CREATE TABLE IF NOT EXISTS festival_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id TEXT NOT NULL UNIQUE,
  title_ro TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  icon TEXT NOT NULL,
  keywords_ro JSONB NOT NULL DEFAULT '[]',
  keywords_ru JSONB NOT NULL DEFAULT '[]',
  content_ro JSONB NOT NULL DEFAULT '[]',
  content_ru JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_festival_rules_section_id ON festival_rules(section_id);
CREATE INDEX idx_festival_rules_sort_order ON festival_rules(sort_order);
CREATE INDEX idx_festival_rules_is_active ON festival_rules(is_active);

-- Enable RLS
ALTER TABLE festival_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read active rules
CREATE POLICY "Allow public read on active festival_rules"
  ON festival_rules
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Only authenticated users (admins) can insert
CREATE POLICY "Allow authenticated users to insert festival_rules"
  ON festival_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update
CREATE POLICY "Allow authenticated users to update festival_rules"
  ON festival_rules
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can delete
CREATE POLICY "Allow authenticated users to delete festival_rules"
  ON festival_rules
  FOR DELETE
  TO authenticated
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_festival_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER festival_rules_updated_at
  BEFORE UPDATE ON festival_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_festival_rules_updated_at();
