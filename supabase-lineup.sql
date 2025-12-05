-- Таблица для артистов lineup
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  genre VARCHAR(100),
  country VARCHAR(100),
  is_headliner BOOLEAN DEFAULT FALSE,
  day INTEGER DEFAULT 1,
  stage VARCHAR(100),
  year VARCHAR(10) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Индекс для быстрого поиска по году
CREATE INDEX IF NOT EXISTS idx_artists_year ON artists(year);

-- Включаем RLS (Row Level Security)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все могут читать
CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

-- Политика для записи - только авторизованные пользователи
CREATE POLICY "Artists can be inserted by authenticated users" ON artists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists can be updated by authenticated users" ON artists
  FOR UPDATE USING (true);

CREATE POLICY "Artists can be deleted by authenticated users" ON artists
  FOR DELETE USING (true);

-- Добавим bucket для изображений артистов (если его еще нет)
INSERT INTO storage.buckets (id, name, public) VALUES ('artists', 'artists', true);

-- Политики для storage bucket artists
CREATE POLICY "Artist images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'artists');

CREATE POLICY "Anyone can upload artist images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'artists');

CREATE POLICY "Anyone can update artist images" ON storage.objects
FOR UPDATE USING (bucket_id = 'artists');

CREATE POLICY "Anyone can delete artist images" ON storage.objects
FOR DELETE USING (bucket_id = 'artists');
