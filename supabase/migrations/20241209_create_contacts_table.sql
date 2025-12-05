-- Create contacts table for managing department contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  department_key VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_contacts table for general contact info (office, social links)
CREATE TABLE IF NOT EXISTS site_contacts (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, phone, email, url, address
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default department contacts
INSERT INTO contacts (department_key, email, phone, sort_order) VALUES
  ('general', 'info@festivalullupilor.md', '+373 60 123 456', 1),
  ('commercial', 'director@festivalullupilor.md', '+373 60 123 457', 2),
  ('partners', 'partners@festivalullupilor.md', '+373 60 123 458', 3),
  ('artists', 'booking@festivalullupilor.md', '+373 60 123 459', 4),
  ('marketing', 'marketing@festivalullupilor.md', '+373 60 123 460', 5),
  ('it', 'it@festivalullupilor.md', '+373 60 123 461', 6)
ON CONFLICT (department_key) DO NOTHING;

-- Insert default site contacts
INSERT INTO site_contacts (key, value, type) VALUES
  ('office_address', 'str. Petricani 17, mun. Chișinău, Moldova', 'address'),
  ('office_hours', 'Пн-Пт: 09:00 - 18:00', 'text'),
  ('main_phone', '+373 60 000 000', 'phone'),
  ('main_email', 'info@festivalullupilor.md', 'email'),
  ('festival_location', 'Saharna, Rezina, Moldova', 'address'),
  ('facebook', 'https://www.facebook.com/festivalullupilor/', 'url'),
  ('instagram', 'https://www.instagram.com/festivalullupilor/', 'url'),
  ('telegram', 'https://t.me/festivalullupilor', 'url'),
  ('tiktok', 'https://www.tiktok.com/@festivalullupilor', 'url'),
  ('youtube', 'https://www.youtube.com/@festivalullupilor', 'url'),
  ('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.8!2d28.8577!3d47.0458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c3628b769a1%3A0x0!2sStrada%20Petricani%2017%2C%20Chi%C8%99in%C4%83u!5e0!3m2!1sro!2smd!4v1', 'url')
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_department_key ON contacts(department_key);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_site_contacts_key ON site_contacts(key);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on contacts" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on site_contacts" ON site_contacts
  FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE contacts IS 'Department contacts with email and phone';
COMMENT ON TABLE site_contacts IS 'General site contact information (office, social links, etc.)';
