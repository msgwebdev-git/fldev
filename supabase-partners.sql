-- Таблица для партнёров фестиваля
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,           -- Название партнёра
  logo_url TEXT,                         -- URL логотипа
  website TEXT,                          -- Сайт партнёра
  category VARCHAR(50) NOT NULL,         -- Категория: patronage, generalPartner, partners, generalMediaPartner, mediaPartners
  year VARCHAR(10) NOT NULL,             -- Год фестиваля
  sort_order INTEGER DEFAULT 0,          -- Порядок сортировки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_partners_year ON partners(year);
CREATE INDEX IF NOT EXISTS idx_partners_category ON partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_year_category ON partners(year, category);

-- Включаем RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать
CREATE POLICY "Partners are viewable by everyone" ON partners
  FOR SELECT USING (true);

-- Политика для записи - только авторизованные пользователи
CREATE POLICY "Partners can be inserted by authenticated users" ON partners
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Partners can be updated by authenticated users" ON partners
  FOR UPDATE USING (true);

CREATE POLICY "Partners can be deleted by authenticated users" ON partners
  FOR DELETE USING (true);

-- Начальные данные партнёров для 2025 года
INSERT INTO partners (name, logo_url, website, category, year, sort_order) VALUES
-- Патронаж
('Ministerul Culturii', 'https://picsum.photos/seed/ministry/400/200', 'https://example.com', 'patronage', '2025', 1),
('Primăria Chișinău', 'https://picsum.photos/seed/primaria/400/200', 'https://example.com', 'patronage', '2025', 2),

-- Генеральный партнёр
('Moldova Agroindbank', 'https://picsum.photos/seed/maib/400/200', 'https://example.com', 'generalPartner', '2025', 1),

-- Партнёры
('Orange Moldova', 'https://picsum.photos/seed/orange/400/200', 'https://example.com', 'partners', '2025', 1),
('Moldcell', 'https://picsum.photos/seed/moldcell/400/200', 'https://example.com', 'partners', '2025', 2),
('Efes Vitanta', 'https://picsum.photos/seed/efes/400/200', 'https://example.com', 'partners', '2025', 3),
('Coca-Cola', 'https://picsum.photos/seed/coca/400/200', 'https://example.com', 'partners', '2025', 4),
('Purcari', 'https://picsum.photos/seed/purcari/400/200', 'https://example.com', 'partners', '2025', 5),
('Cricova', 'https://picsum.photos/seed/cricova/400/200', 'https://example.com', 'partners', '2025', 6),

-- Генеральный медиа-партнёр
('PRO TV Chișinău', 'https://picsum.photos/seed/protv/400/200', 'https://example.com', 'generalMediaPartner', '2025', 1),
('Radio Noroc', 'https://picsum.photos/seed/noroc/400/200', 'https://example.com', 'generalMediaPartner', '2025', 2),

-- Медиа-партнёры
('Jurnal TV', 'https://picsum.photos/seed/jurnal/400/200', 'https://example.com', 'mediaPartners', '2025', 1),
('TV8', 'https://picsum.photos/seed/tv8/400/200', 'https://example.com', 'mediaPartners', '2025', 2),
('Publika TV', 'https://picsum.photos/seed/publika/400/200', 'https://example.com', 'mediaPartners', '2025', 3),
('Radio Kiss FM', 'https://picsum.photos/seed/kiss/400/200', 'https://example.com', 'mediaPartners', '2025', 4),
('Locals.md', 'https://picsum.photos/seed/locals/400/200', 'https://example.com', 'mediaPartners', '2025', 5),
('Afisha.md', 'https://picsum.photos/seed/afisha/400/200', 'https://example.com', 'mediaPartners', '2025', 6),
('#diez', 'https://picsum.photos/seed/diez/400/200', 'https://example.com', 'mediaPartners', '2025', 7),
('Zugo.md', 'https://picsum.photos/seed/zugo/400/200', 'https://example.com', 'mediaPartners', '2025', 8);
