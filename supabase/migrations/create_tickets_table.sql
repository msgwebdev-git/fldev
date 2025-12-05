-- Drop existing tables
DROP TABLE IF EXISTS ticket_options CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;

-- Create tickets table with multi-language support
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  features_ro TEXT[] DEFAULT '{}',
  features_ru TEXT[] DEFAULT '{}',
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'MDL',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  max_per_order INTEGER DEFAULT 10,
  has_options BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_options table with multi-language support
CREATE TABLE ticket_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  price_modifier NUMERIC(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON tickets FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read ticket_options" ON ticket_options FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users full access" ON tickets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users manage options" ON ticket_options FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert tickets
INSERT INTO tickets (name, name_ro, name_ru, description_ro, description_ru, features_ro, features_ru, price, original_price, sort_order, has_options) VALUES
(
  'dayPass',
  'Day Pass',
  'Дневной пропуск',
  'Acces pe teritoriul festivalului fără camping - 1 zi',
  'Доступ на территорию фестиваля без кемпинга - 1 день',
  ARRAY['Acces pe teritoriul festivalului fără camping', '1 zi de festival la alegere', '1 adult', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля без кемпинга', '1 день фестиваля на выбор', '1 взрослый', 'Дети до 7 лет - бесплатно'],
  380.00, 500.00, 1, false
),
(
  'weekendPass',
  'Weekend Pass',
  'Пропуск на выходные',
  'Acces pe teritoriul festivalului fără camping - 2 zile',
  'Доступ на территорию фестиваля без кемпинга - 2 дня',
  ARRAY['Acces pe teritoriul festivalului fără camping', '2 zile de festival', '1 adult', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля без кемпинга', '2 дня фестиваля', '1 взрослый', 'Дети до 7 лет - бесплатно'],
  600.00, 800.00, 2, false
),
(
  'familyDayPass',
  'Family Day Pass',
  'Семейный дневной пропуск',
  'Bilet de familie pentru 1 zi de festival',
  'Семейный билет на 1 день фестиваля',
  ARRAY['Acces pe teritoriul festivalului fără camping', '1 zi de festival la alegere', '2 adulți + max 2 copii de la 8 până la 14 ani', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля без кемпинга', '1 день фестиваля на выбор', '2 взрослых + макс. 2 ребёнка от 8 до 14 лет', 'Дети до 7 лет - бесплатно'],
  900.00, 1200.00, 3, false
),
(
  'familyWeekendPass',
  'Family Weekend Pass',
  'Семейный пропуск на выходные',
  'Bilet de familie pentru 2 zile de festival',
  'Семейный билет на 2 дня фестиваля',
  ARRAY['Acces pe teritoriul festivalului fără camping', '2 zile de festival', '2 adulți + max 2 copii de la 8 până la 14 ani', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля без кемпинга', '2 дня фестиваля', '2 взрослых + макс. 2 ребёнка от 8 до 14 лет', 'Дети до 7 лет - бесплатно'],
  1500.00, 2000.00, 4, false
),
(
  'campingPass',
  'Camping Pass',
  'Кемпинг пропуск',
  'Acces la festival cu cazare în camping - 3 zile',
  'Доступ на фестиваль с проживанием в кемпинге - 3 дня',
  ARRAY['Acces pe teritoriul festivalului și cazare în camping', '3 zile de festival', '1 adult', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля и проживание в кемпинге', '3 дня фестиваля', '1 взрослый', 'Дети до 7 лет - бесплатно'],
  750.00, 1000.00, 5, true
),
(
  'familyCampingPass',
  'Family Camping Pass',
  'Семейный кемпинг пропуск',
  'Bilet de familie cu camping pentru 3 zile',
  'Семейный билет с кемпингом на 3 дня',
  ARRAY['Acces pe teritoriul festivalului și cazare în camping', '3 zile de festival', '2 adulți + max 2 copii de la 8 până la 14 ani', 'Copiii până la 7 ani au acces gratuit'],
  ARRAY['Доступ на территорию фестиваля и проживание в кемпинге', '3 дня фестиваля', '2 взрослых + макс. 2 ребёнка от 8 до 14 лет', 'Дети до 7 лет - бесплатно'],
  1900.00, 2500.00, 6, true
);

-- Insert options for Camping Pass
INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'tentSpot', 'Tent Spot', 'Место для палатки', 'Amplasarea cortului în zona fără vehicule', 'Размещение палатки в зоне без автомобилей', true, 1
FROM tickets WHERE name = 'campingPass';

INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'parkingSpot', 'Parking Spot', 'Парковочное место', 'Parcare pentru 1 vehicul în zona de camping', 'Парковка для 1 автомобиля в зоне кемпинга', false, 2
FROM tickets WHERE name = 'campingPass';

INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'camperSpot', 'Camper / RV Spot', 'Место для автодома', 'Parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă', 'Парковка для кемпера, прицепа или автомобиля с размещением палатки рядом', false, 3
FROM tickets WHERE name = 'campingPass';

-- Insert options for Family Camping Pass
INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'tentSpot', 'Tent Spot', 'Место для палатки', 'Amplasarea cortului în zona fără vehicule', 'Размещение палатки в зоне без автомобилей', true, 1
FROM tickets WHERE name = 'familyCampingPass';

INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'parkingSpot', 'Parking Spot', 'Парковочное место', 'Parcare pentru 1 vehicul în zona de camping', 'Парковка для 1 автомобиля в зоне кемпинга', false, 2
FROM tickets WHERE name = 'familyCampingPass';

INSERT INTO ticket_options (ticket_id, name, name_ro, name_ru, description_ro, description_ru, is_default, sort_order)
SELECT id, 'camperSpot', 'Camper / RV Spot', 'Место для автодома', 'Parcare pentru camper, rulotă sau vehicul cu amplasarea cortului lângă', 'Парковка для кемпера, прицепа или автомобиля с размещением палатки рядом', false, 3
FROM tickets WHERE name = 'familyCampingPass';
