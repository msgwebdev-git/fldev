-- Таблица для программы фестиваля
CREATE TABLE IF NOT EXISTS program_events (
  id SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL,          -- Дата в формате "7 August"
  day INTEGER NOT NULL DEFAULT 1,      -- Номер дня (1, 2, 3)
  time VARCHAR(10) NOT NULL,           -- Время выступления "16:00"
  artist VARCHAR(255) NOT NULL,        -- Название артиста/события
  stage VARCHAR(50) NOT NULL,          -- Сцена: main, stage2, electronic
  genre VARCHAR(100),                  -- Жанр музыки
  is_headliner BOOLEAN DEFAULT FALSE,  -- Хедлайнер или нет
  year VARCHAR(10) NOT NULL,           -- Год фестиваля
  sort_order INTEGER DEFAULT 0,        -- Порядок сортировки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_program_events_year ON program_events(year);
CREATE INDEX IF NOT EXISTS idx_program_events_day ON program_events(day);
CREATE INDEX IF NOT EXISTS idx_program_events_year_day ON program_events(year, day);

-- Включаем RLS (Row Level Security)
ALTER TABLE program_events ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать
CREATE POLICY "Program events are viewable by everyone" ON program_events
  FOR SELECT USING (true);

-- Политика для записи - только авторизованные пользователи
CREATE POLICY "Program events can be inserted by authenticated users" ON program_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Program events can be updated by authenticated users" ON program_events
  FOR UPDATE USING (true);

CREATE POLICY "Program events can be deleted by authenticated users" ON program_events
  FOR DELETE USING (true);

-- Начальные данные программы для 2025 года
INSERT INTO program_events (date, day, time, artist, stage, genre, is_headliner, year, sort_order) VALUES
-- День 1 - 7 August
('7 August', 1, '16:00', 'DJ Warm-up Set', 'main', 'Electronic', false, '2025', 1),
('7 August', 1, '17:00', 'Gândul Mâței', 'stage2', 'Folk Rock', false, '2025', 2),
('7 August', 1, '18:00', 'Snails', 'main', 'Alternative', false, '2025', 3),
('7 August', 1, '19:00', 'Vali Boghean Band', 'main', 'Balkan', true, '2025', 4),
('7 August', 1, '20:30', 'La Caravane Passe', 'main', 'World Music', true, '2025', 5),
('7 August', 1, '22:00', 'Subcarpați', 'main', 'Hip-Hop / Folk', true, '2025', 6),
('7 August', 1, '23:30', 'Night DJ Set', 'electronic', 'Electronic', false, '2025', 7),

-- День 2 - 8 August
('8 August', 2, '15:00', 'Workshop: Muzică tradițională', 'stage2', 'Workshop', false, '2025', 1),
('8 August', 2, '16:30', 'Carla''s Dreams (DJ Set)', 'electronic', 'Electronic', false, '2025', 2),
('8 August', 2, '17:30', 'Tudor Ungureanu', 'main', 'Rock', false, '2025', 3),
('8 August', 2, '19:00', 'Lupii lui Calancea', 'main', 'Folk Rock', true, '2025', 4),
('8 August', 2, '20:30', 'Shantel', 'main', 'Balkan Beat', true, '2025', 5),
('8 August', 2, '22:00', 'Zdob și Zdub', 'main', 'Rock / Folk', true, '2025', 6),
('8 August', 2, '00:00', 'Afterparty DJ Set', 'electronic', 'Electronic', false, '2025', 7),

-- День 3 - 9 August
('9 August', 3, '14:00', 'Family Concert', 'stage2', 'Family', false, '2025', 1),
('9 August', 3, '16:00', 'Alternosfera', 'main', 'Alternative Rock', false, '2025', 2),
('9 August', 3, '17:30', 'The Motans', 'main', 'Pop Rock', false, '2025', 3),
('9 August', 3, '19:00', 'Cuibul', 'main', 'Rock', true, '2025', 4),
('9 August', 3, '20:30', 'Dubioza Kolektiv', 'main', 'Balkan Punk', true, '2025', 5),
('9 August', 3, '22:30', 'Grand Finale Show', 'main', 'Special', true, '2025', 6),
('9 August', 3, '00:00', 'Closing Party', 'electronic', 'Electronic', false, '2025', 7);
