-- Migration: Insert activities data
-- Date: 2025-12-10
-- Description: Populate activities table with data in Romanian and Russian for 2025

-- ==========================================
-- ENTERTAINMENT (Развлечения)
-- ==========================================

INSERT INTO activities (title_ro, title_ru, description_ro, description_ru, category, icon, location, time, is_highlight, year, sort_order)
VALUES
  (
    'Concerte pe scena principală',
    'Концерты на главной сцене',
    'Spectacole ale headlinerilor și artiștilor celebri pe scena principală a festivalului',
    'Выступления хедлайнеров и известных артистов на главной сцене фестиваля',
    'entertainment',
    'music',
    'Scena Principală',
    NULL,
    true,
    '2025',
    1
  ),
  (
    'Zona electronică',
    'Электронная зона',
    'DJ-seturi și muzică electronică toată noaptea',
    'DJ-сеты и электронная музыка всю ночь напролёт',
    'entertainment',
    'sparkles',
    'Zona Electronică',
    '22:00 - 06:00',
    false,
    '2025',
    2
  ),
  (
    'Instalații de artă',
    'Арт-инсталляции',
    'Instalații artistice interactive pe tot teritoriul festivalului',
    'Интерактивные художественные инсталляции по всей территории фестиваля',
    'entertainment',
    'palette',
    NULL,
    NULL,
    false,
    '2025',
    3
  );

-- ==========================================
-- WORKSHOPS (Мастер-классы)
-- ==========================================

INSERT INTO activities (title_ro, title_ru, description_ro, description_ru, category, icon, location, time, is_highlight, year, sort_order)
VALUES
  (
    'Atelierul meșteșugurilor',
    'Мастерская ремёсел',
    'Învață meserii tradiționale moldovenești de la maeștri',
    'Научись традиционным молдавским ремёслам от мастеров',
    'workshops',
    'palette',
    'Zona Meșteșugurilor',
    '10:00 - 18:00',
    false,
    '2025',
    1
  ),
  (
    'Workshop muzical',
    'Музыкальный воркшоп',
    'Masterclass-uri de cântare la instrumente tradiționale',
    'Мастер-классы по игре на традиционных инструментах',
    'workshops',
    'music',
    'Scena 2',
    '14:00 - 16:00',
    false,
    '2025',
    2
  ),
  (
    'Zona foto',
    'Фотозона',
    'Zone foto profesionale pentru amintiri strălucitoare',
    'Профессиональные фотозоны для ярких воспоминаний',
    'workshops',
    'camera',
    NULL,
    NULL,
    false,
    '2025',
    3
  );

-- ==========================================
-- RELAXATION (Отдых)
-- ==========================================

INSERT INTO activities (title_ro, title_ru, description_ro, description_ru, category, icon, location, time, is_highlight, year, sort_order)
VALUES
  (
    'Camping',
    'Кемпинг',
    'Camping confortabil cu vedere la natură și cerul înstelat',
    'Комфортный кемпинг с видом на природу и звёздное небо',
    'relaxation',
    'tent',
    NULL,
    NULL,
    true,
    '2025',
    1
  ),
  (
    'Plimbări în natură',
    'Прогулки на природе',
    'Excursii matinale prin împrejurimile pitorești',
    'Утренние экскурсии по живописным окрестностям',
    'relaxation',
    'treePine',
    NULL,
    '09:00 - 12:00',
    false,
    '2025',
    2
  ),
  (
    'Zona de relaxare',
    'Зона отдыха',
    'Loc liniștit pentru relaxare între concerte',
    'Тихое место для релаксации между концертами',
    'relaxation',
    'heart',
    NULL,
    NULL,
    false,
    '2025',
    3
  );

-- ==========================================
-- FOOD (Еда и напитки)
-- ==========================================

INSERT INTO activities (title_ro, title_ru, description_ro, description_ru, category, icon, location, time, is_highlight, year, sort_order)
VALUES
  (
    'Food Court',
    'Фуд-корт',
    'Varietate de bucătării din lume și delicatese locale',
    'Разнообразие кухонь мира и местные деликатесы',
    'food',
    'utensils',
    NULL,
    '10:00 - 02:00',
    true,
    '2025',
    1
  ),
  (
    'Bucătărie moldovenească',
    'Молдавская кухня',
    'Preparate tradiționale moldovenești de la cei mai buni bucătari',
    'Традиционные молдавские блюда от лучших поваров',
    'food',
    'utensils',
    NULL,
    NULL,
    false,
    '2025',
    2
  ),
  (
    'Zona de bar',
    'Бар-зона',
    'Bere artizanală, vin și cocktailuri',
    'Крафтовое пиво, вино и коктейли',
    'food',
    'sparkles',
    NULL,
    '12:00 - 04:00',
    false,
    '2025',
    3
  );

-- ==========================================
-- FAMILY (Семья)
-- ==========================================

INSERT INTO activities (title_ro, title_ru, description_ro, description_ru, category, icon, location, time, is_highlight, year, sort_order)
VALUES
  (
    'Zona pentru copii',
    'Детская зона',
    'Spațiu sigur și distractiv pentru copii de toate vârstele',
    'Безопасное и весёлое пространство для детей всех возрастов',
    'family',
    'users',
    'Zona Familiei',
    '10:00 - 20:00',
    true,
    '2025',
    1
  ),
  (
    'Activități pentru familie',
    'Семейные активности',
    'Jocuri și distracții pentru toată familia',
    'Игры и развлечения для всей семьи',
    'family',
    'heart',
    NULL,
    NULL,
    false,
    '2025',
    2
  ),
  (
    'Ateliere creative',
    'Творческие мастер-классы',
    'Desen, modelare și alte activități pentru copii',
    'Рисование, лепка и другие занятия для детей',
    'family',
    'palette',
    NULL,
    '11:00 - 17:00',
    false,
    '2025',
    3
  );
