-- Create site_settings table for marketing scripts and other configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users manage site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default marketing settings
INSERT INTO site_settings (key, value, description, category) VALUES
  ('ga4_id', '', 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)', 'marketing'),
  ('gtm_id', '', 'Google Tag Manager ID (GTM-XXXXXXX)', 'marketing'),
  ('facebook_pixel_id', '', 'Facebook/Meta Pixel ID', 'marketing'),
  ('tiktok_pixel_id', '', 'TikTok Pixel ID', 'marketing'),
  ('yandex_metrica_id', '', 'Yandex Metrica Counter ID', 'marketing'),
  ('custom_head_scripts', '', 'Custom scripts to inject in <head>', 'marketing'),
  ('custom_body_scripts', '', 'Custom scripts to inject at end of <body>', 'marketing')
ON CONFLICT (key) DO NOTHING;
