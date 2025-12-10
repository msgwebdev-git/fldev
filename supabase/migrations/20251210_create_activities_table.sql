-- Create activities table with multilingual support
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ro TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  category TEXT NOT NULL CHECK (category IN ('entertainment', 'workshops', 'relaxation', 'food', 'family')),
  icon TEXT NOT NULL,
  location TEXT,
  time TEXT,
  is_highlight BOOLEAN DEFAULT false,
  year TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_activities_year ON activities(year);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_sort_order ON activities(sort_order);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read activities
CREATE POLICY "Allow public read on activities"
  ON activities
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users (admins) can insert
CREATE POLICY "Allow authenticated users to insert activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update
CREATE POLICY "Allow authenticated users to update activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can delete
CREATE POLICY "Allow authenticated users to delete activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
