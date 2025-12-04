-- Таблица для активностей фестиваля
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,           -- Название активности
  description TEXT,                       -- Описание активности
  category VARCHAR(50) NOT NULL,          -- Категория: entertainment, workshops, relaxation, food, family
  icon VARCHAR(50) DEFAULT 'sparkles',    -- Иконка: music, palette, tent, utensils, users, sparkles, camera, heart, treePine
  location VARCHAR(255),                  -- Локация
  time VARCHAR(50),                       -- Время работы
  is_highlight BOOLEAN DEFAULT FALSE,     -- Выделенная активность
  year VARCHAR(10) NOT NULL,              -- Год фестиваля
  sort_order INTEGER DEFAULT 0,           -- Порядок сортировки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_activities_year ON activities(year);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_year_category ON activities(year, category);

-- Включаем RLS (Row Level Security)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать
CREATE POLICY "Activities are viewable by everyone" ON activities
  FOR SELECT USING (true);

-- Политика для записи - только авторизованные пользователи
CREATE POLICY "Activities can be inserted by authenticated users" ON activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Activities can be updated by authenticated users" ON activities
  FOR UPDATE USING (true);

CREATE POLICY "Activities can be deleted by authenticated users" ON activities
  FOR DELETE USING (true);

-- Начальные данные активностей для 2025 года
INSERT INTO activities (title, description, category, icon, location, time, is_highlight, year, sort_order) VALUES
-- Развлечения (entertainment)
('Концерты на главной сцене', 'Выступления хедлайнеров и известных артистов на главной сцене фестиваля', 'entertainment', 'music', 'Scena Principală', NULL, true, '2025', 1),
('Электронная зона', 'DJ-сеты и электронная музыка всю ночь напролёт', 'entertainment', 'sparkles', 'Zona Electronică', '22:00 - 06:00', false, '2025', 2),
('Арт-инсталляции', 'Интерактивные художественные инсталляции по всей территории фестиваля', 'entertainment', 'palette', NULL, NULL, false, '2025', 3),

-- Мастер-классы (workshops)
('Мастерская ремёсел', 'Научись традиционным молдавским ремёслам от мастеров', 'workshops', 'palette', 'Zona Meșteșugurilor', '10:00 - 18:00', false, '2025', 1),
('Музыкальный воркшоп', 'Мастер-классы по игре на традиционных инструментах', 'workshops', 'music', 'Scena 2', '14:00 - 16:00', false, '2025', 2),
('Фотозона', 'Профессиональные фотозоны для ярких воспоминаний', 'workshops', 'camera', NULL, NULL, false, '2025', 3),

-- Отдых (relaxation)
('Кемпинг', 'Комфортный кемпинг с видом на природу и звёздное небо', 'relaxation', 'tent', NULL, NULL, true, '2025', 1),
('Прогулки на природе', 'Утренние экскурсии по живописным окрестностям', 'relaxation', 'treePine', NULL, '09:00 - 12:00', false, '2025', 2),
('Зона отдыха', 'Тихое место для релаксации между концертами', 'relaxation', 'heart', NULL, NULL, false, '2025', 3),

-- Еда (food)
('Фуд-корт', 'Разнообразие кухонь мира и местные деликатесы', 'food', 'utensils', NULL, '10:00 - 02:00', true, '2025', 1),
('Молдавская кухня', 'Традиционные молдавские блюда от лучших поваров', 'food', 'utensils', NULL, NULL, false, '2025', 2),
('Бар-зона', 'Крафтовое пиво, вино и коктейли', 'food', 'sparkles', NULL, '12:00 - 04:00', false, '2025', 3),

-- Семья (family)
('Детская зона', 'Безопасное и весёлое пространство для детей всех возрастов', 'family', 'users', 'Zona Familiei', '10:00 - 20:00', true, '2025', 1),
('Семейные активности', 'Игры и развлечения для всей семьи', 'family', 'heart', NULL, NULL, false, '2025', 2),
('Творческие мастер-классы', 'Рисование, лепка и другие занятия для детей', 'family', 'palette', NULL, '11:00 - 17:00', false, '2025', 3);
