-- Gallery table for storing photo metadata
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  year VARCHAR(4) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  width INTEGER DEFAULT 800,
  height INTEGER DEFAULT 600,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries by year
CREATE INDEX IF NOT EXISTS idx_gallery_year ON gallery(year);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

-- Enable Row Level Security
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read gallery photos
CREATE POLICY "Public Access" ON gallery
  FOR SELECT
  USING (true);

-- Policy: Only authenticated admins can insert
CREATE POLICY "Admin Insert" ON gallery
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can update
CREATE POLICY "Admin Update" ON gallery
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can delete
CREATE POLICY "Admin Delete" ON gallery
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_updated_at();

-- Insert sample data for 2022 (you'll replace this with actual data after uploading photos)
-- Uncomment and modify after uploading your photos:
-- INSERT INTO gallery (year, filename, alt_text, display_order) VALUES
--   ('2022', 'IMG_001', 'Festival Lupilor 2022 - Photo 1', 1),
--   ('2022', 'IMG_002', 'Festival Lupilor 2022 - Photo 2', 2);
