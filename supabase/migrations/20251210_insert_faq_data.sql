-- Migration: Insert FAQ data from website
-- Date: 2025-12-10
-- Description: Populate FAQ table with questions and answers in Romanian and Russian

-- Clear existing FAQ data (optional, comment out if you want to keep existing data)
-- DELETE FROM faq;

-- ==========================================
-- TICKETS FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'De unde pot cumpăra bilete?',
    'Где можно купить билеты?',
    'Biletele pot fi achiziționate online de pe site-ul oficial al festivalului sau de la punctele de vânzare partenere. Recomandăm achiziționarea online pentru a evita cozile.',
    'Билеты можно приобрести онлайн на официальном сайте фестиваля или в партнёрских точках продаж. Рекомендуем покупать онлайн, чтобы избежать очередей.',
    'tickets',
    1,
    true
  ),
  (
    'Ce tipuri de bilete sunt disponibile?',
    'Какие типы билетов доступны?',
    'Oferim bilete pentru o zi, abonamente pentru toate cele 3 zile, bilete VIP cu acces în zonele exclusive și pachete cu camping inclus.',
    'Мы предлагаем однодневные билеты, абонементы на все 3 дня, VIP-билеты с доступом в эксклюзивные зоны и пакеты с включённым кемпингом.',
    'tickets',
    2,
    true
  ),
  (
    'Pot returna sau schimba biletul?',
    'Можно ли вернуть или обменять билет?',
    'Biletele nu pot fi returnate, dar pot fi transferate altei persoane. Contactează-ne pentru detalii despre procedura de transfer.',
    'Билеты не подлежат возврату, но могут быть переоформлены на другое лицо. Свяжитесь с нами для уточнения процедуры переоформления.',
    'tickets',
    3,
    true
  ),
  (
    'Ce fac dacă pierd biletul sau brățara?',
    'Что делать, если потерял билет или браслет?',
    'Prezintă-te la punctul de informații cu un act de identitate și dovada achiziției pentru a primi o brățară de înlocuire.',
    'Обратитесь в информационный пункт с документом, удостоверяющим личность, и подтверждением покупки для получения нового браслета.',
    'tickets',
    4,
    true
  ),
  (
    'Copiii au nevoie de bilet?',
    'Нужен ли билет для детей?',
    'Copiii sub 7 ani au intrare gratuită. De la 7 ani este necesar un bilet. Copiii sub 14 ani trebuie însoțiți de un adult.',
    'Дети до 7 лет проходят бесплатно. С 7 лет необходим билет. Дети до 14 лет должны быть в сопровождении взрослого.',
    'tickets',
    5,
    true
  );

-- ==========================================
-- CAMPING FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Este inclus camping-ul în prețul biletului?',
    'Включён ли кемпинг в стоимость билета?',
    'Camping-ul standard este inclus în biletele de 3 zile. Pentru camping premium sau family camping, este necesar un bilet separat.',
    'Стандартный кемпинг включён в трёхдневные билеты. Для премиум-кемпинга или family camping требуется отдельный билет.',
    'camping',
    1,
    true
  ),
  (
    'Ce facilități sunt în zona de camping?',
    'Какие удобства есть в кемпинге?',
    'Zona de camping dispune de dușuri, toalete, stații de încărcare pentru telefoane, apă potabilă și pază 24/7.',
    'В зоне кемпинга есть душевые, туалеты, станции зарядки телефонов, питьевая вода и охрана 24/7.',
    'camping',
    2,
    true
  ),
  (
    'Pot veni cu rulota sau autorulota?',
    'Можно приехать с автодомом или прицепом?',
    'Da, există o zonă dedicată pentru rulote și autorulote. Este necesar un bilet special pentru această zonă.',
    'Да, есть специальная зона для автодомов и прицепов. Для этой зоны необходим специальный билет.',
    'camping',
    3,
    true
  ),
  (
    'Când pot instala cortul?',
    'Когда можно установить палатку?',
    'Accesul în camping începe cu o zi înainte de festival, de la ora 18:00. Cortul trebuie demontat până la ora 12:00 a zilei de după festival.',
    'Доступ в кемпинг открывается за день до фестиваля с 18:00. Палатку нужно убрать до 12:00 дня после окончания фестиваля.',
    'camping',
    4,
    true
  ),
  (
    'Sunt permise focurile în camping?',
    'Разрешены ли костры в кемпинге?',
    'Nu, focurile deschise sunt strict interzise în camping și pe teritoriul festivalului. Sunt disponibile zone de grătar amenajate.',
    'Нет, открытый огонь строго запрещён в кемпинге и на территории фестиваля. Доступны оборудованные зоны для гриля.',
    'camping',
    5,
    true
  );

-- ==========================================
-- TRANSPORT FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Cum ajung la festival cu mașina?',
    'Как добраться до фестиваля на машине?',
    'Festivalul se află în Orheiul Vechi, la 50 km de Chișinău. Urmează indicatoarele spre festival. Parcarea este gratuită.',
    'Фестиваль проходит в Orheiul Vechi, в 50 км от Кишинёва. Следуйте указателям к фестивалю. Парковка бесплатная.',
    'transport',
    1,
    true
  ),
  (
    'Există transport organizat din Chișinău?',
    'Есть ли организованный транспорт из Кишинёва?',
    'Da, în zilele festivalului vor circula autobuze speciale din Chișinău. Programul și locațiile de plecare vor fi anunțate pe site.',
    'Да, в дни фестиваля курсируют специальные автобусы из Кишинёва. Расписание и места отправления будут объявлены на сайте.',
    'transport',
    2,
    true
  ),
  (
    'Pot pleca și reveni în aceeași zi?',
    'Можно ли уехать и вернуться в тот же день?',
    'Da, cu brățara validă poți ieși și reintra pe teritoriul festivalului. Ultimul autobuz spre Chișinău pleacă la miezul nopții.',
    'Да, с действительным браслетом можно выходить и возвращаться на территорию фестиваля. Последний автобус в Кишинёв отправляется в полночь.',
    'transport',
    3,
    true
  ),
  (
    'Este disponibilă parcarea peste noapte?',
    'Доступна ли ночная парковка?',
    'Da, parcarea este disponibilă 24/7 pe toată durata festivalului și este gratuită.',
    'Да, парковка работает круглосуточно на протяжении всего фестиваля и бесплатна.',
    'transport',
    4,
    true
  );

-- ==========================================
-- CHILDREN FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Este festivalul potrivit pentru copii?',
    'Подходит ли фестиваль для детей?',
    'Da! Avem o zonă dedicată familiilor cu activități pentru copii, ateliere creative și animatori profesioniști.',
    'Да! У нас есть специальная зона для семей с активностями для детей, творческими мастер-классами и профессиональными аниматорами.',
    'children',
    1,
    true
  ),
  (
    'Ce documente sunt necesare pentru copii?',
    'Какие документы нужны для детей?',
    'Este necesar un act de identitate pentru adult și certificatul de naștere al copilului (original sau copie).',
    'Необходим документ, удостоверяющий личность взрослого, и свидетельство о рождении ребёнка (оригинал или копия).',
    'children',
    2,
    true
  ),
  (
    'Există zone liniștite pentru familii?',
    'Есть ли тихие зоны для семей?',
    'Da, Family Camping este o zonă de liniște între orele 23:00 - 07:00, ideală pentru familii cu copii mici.',
    'Да, Family Camping — это зона тишины с 23:00 до 07:00, идеальная для семей с маленькими детьми.',
    'children',
    3,
    true
  ),
  (
    'Pot aduce cărucioare pentru copii?',
    'Можно ли привезти детскую коляску?',
    'Da, cărucioarele sunt permise, dar terenul poate fi accidentat în unele zone. Recomandăm cărucior cu roți mari.',
    'Да, коляски разрешены, но в некоторых местах рельеф может быть неровным. Рекомендуем коляску с большими колёсами.',
    'children',
    4,
    true
  );

-- ==========================================
-- FOOD FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Pot aduce propria mâncare și băuturi?',
    'Можно ли принести свою еду и напитки?',
    'Nu este permisă introducerea de mâncare și băuturi, cu excepția apei plate în recipiente de plastic. Excepții: mâncare pentru copii și diete medicale.',
    'Проносить еду и напитки запрещено, кроме негазированной воды в пластиковых бутылках. Исключения: детское питание и диетические продукты по медицинским показаниям.',
    'food',
    1,
    true
  ),
  (
    'Ce opțiuni de mâncare sunt disponibile?',
    'Какие варианты еды доступны?',
    'Food court-ul nostru oferă bucătărie moldovenească tradițională, balcanică, street food internațional și opțiuni vegetariene/vegane.',
    'Наш фуд-корт предлагает традиционную молдавскую, балканскую кухню, международный стрит-фуд и вегетарианские/веганские опции.',
    'food',
    2,
    true
  ),
  (
    'Sunt acceptate plățile cu cardul?',
    'Принимаются ли карты для оплаты?',
    'Da, majoritatea punctelor de vânzare acceptă plata cu cardul. Recomandăm totuși să ai și numerar pentru unele zone.',
    'Да, большинство точек принимают оплату картой. Рекомендуем также иметь наличные для некоторых зон.',
    'food',
    3,
    true
  ),
  (
    'Există opțiuni pentru alergii alimentare?',
    'Есть ли опции для людей с пищевой аллергией?',
    'Da, standurile noastre de mâncare afișează alergenii. Personal este disponibil să ofere informații despre ingrediente.',
    'Да, наши точки питания указывают аллергены. Персонал готов предоставить информацию об ингредиентах.',
    'food',
    4,
    true
  );

-- ==========================================
-- SAFETY FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Există servicii medicale pe loc?',
    'Есть ли медицинская помощь на месте?',
    'Da, echipe medicale și puncte de prim ajutor sunt disponibile 24/7 pe toată durata festivalului.',
    'Да, медицинские бригады и пункты первой помощи работают 24/7 на протяжении всего фестиваля.',
    'safety',
    1,
    true
  ),
  (
    'Ce obiecte sunt interzise?',
    'Какие предметы запрещены?',
    'Sunt interzise: arme, substanțe ilegale, artificii, drone, sticlărie, obiecte tăioase, spray-uri și băuturi alcoolice.',
    'Запрещены: оружие, запрещённые вещества, фейерверки, дроны, стеклянная тара, острые предметы, спреи и алкогольные напитки.',
    'safety',
    2,
    true
  ),
  (
    'Cum funcționează controlul de securitate?',
    'Как проходит контроль безопасности?',
    'La intrare, toate persoanele și bagajele sunt verificate de echipa de securitate. Vă rugăm să aveți răbdare și să cooperați.',
    'На входе все посетители и их вещи проверяются службой безопасности. Просим проявить терпение и сотрудничать.',
    'safety',
    3,
    true
  ),
  (
    'Ce fac în caz de urgență?',
    'Что делать в экстренной ситуации?',
    'Contactează cel mai apropiat membru al echipei de securitate sau prezintă-te la punctul medical/informații.',
    'Обратитесь к ближайшему сотруднику охраны или пройдите к медицинскому/информационному пункту.',
    'safety',
    4,
    true
  );

-- ==========================================
-- LOCATION FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Unde are loc festivalul?',
    'Где проходит фестиваль?',
    'Festivalul se desfășoară în rezervația naturală Orheiul Vechi, în satul Trebujeni, la aproximativ 50 km de Chișinău.',
    'Фестиваль проходит в природном заповеднике Orheiul Vechi, в селе Требужены, примерно в 50 км от Кишинёва.',
    'location',
    1,
    true
  ),
  (
    'Ce condiții meteo să mă aștept?',
    'Какой погоды ожидать?',
    'În august, temperaturile sunt de obicei între 20-35°C ziua. Serile pot fi răcoroase. Recomandăm și haine de ploaie.',
    'В августе температура обычно 20-35°C днём. Вечера могут быть прохладными. Рекомендуем взять и дождевую одежду.',
    'location',
    2,
    true
  ),
  (
    'Există loc de cazare în apropiere?',
    'Есть ли жильё поблизости?',
    'Pe lângă camping, există pensiuni și hoteluri în zonă. Recomandăm rezervarea din timp în perioada festivalului.',
    'Помимо кемпинга, в районе есть гостевые дома и отели. Рекомендуем бронировать заранее в период фестиваля.',
    'location',
    3,
    true
  );

-- ==========================================
-- APP FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Există o aplicație oficială a festivalului?',
    'Есть ли официальное приложение фестиваля?',
    'Da! Aplicația Festivalul Lupilor este disponibilă gratuit pe iOS și Android și include programul complet, hartă și notificări.',
    'Да! Приложение Festivalul Lupilor бесплатно доступно на iOS и Android и включает полную программу, карту и уведомления.',
    'app',
    1,
    true
  ),
  (
    'Ce funcții are aplicația?',
    'Какие функции есть в приложении?',
    'Program personalizat, hartă interactivă, notificări push pentru artiștii favoriți, informații despre standuri și activități.',
    'Персональное расписание, интерактивная карта, push-уведомления о любимых артистах, информация о точках питания и активностях.',
    'app',
    2,
    true
  ),
  (
    'Funcționează aplicația offline?',
    'Работает ли приложение офлайн?',
    'Da, programul și harta pot fi accesate offline după ce le descarci prima dată în aplicație.',
    'Да, программа и карта доступны офлайн после первой загрузки в приложении.',
    'app',
    3,
    true
  );

-- ==========================================
-- GENERAL FAQ
-- ==========================================

INSERT INTO faq (question_ro, question_ru, answer_ro, answer_ru, category, sort_order, is_active)
VALUES
  (
    'Care sunt datele festivalului?',
    'Какие даты проведения фестиваля?',
    'Festivalul Lupilor 2026 va avea loc în perioada 7-9 august 2026.',
    'Festivalul Lupilor 2026 пройдёт 7-9 августа 2026 года.',
    'general',
    1,
    true
  ),
  (
    'Pot face fotografii și filmări?',
    'Можно ли фотографировать и снимать видео?',
    'Da, fotografiile și filmările pentru uz personal sunt permise. Pentru presă sau scop comercial, este necesar acreditare.',
    'Да, фото и видеосъёмка для личного использования разрешены. Для прессы или коммерческих целей требуется аккредитация.',
    'general',
    2,
    true
  ),
  (
    'Există WiFi pe teritoriul festivalului?',
    'Есть ли WiFi на территории фестиваля?',
    'WiFi gratuit este disponibil în zonele principale, dar semnalul poate fi limitat în zonele aglomerate.',
    'Бесплатный WiFi доступен в основных зонах, но сигнал может быть ограничен в местах скопления людей.',
    'general',
    3,
    true
  ),
  (
    'Sunt permise animalele de companie?',
    'Разрешены ли домашние животные?',
    'Din motive de siguranță și confort, animalele de companie nu sunt permise pe teritoriul festivalului.',
    'По соображениям безопасности и комфорта домашние животные на территорию фестиваля не допускаются.',
    'general',
    4,
    true
  );

-- ==========================================
-- SUMMARY
-- ==========================================

-- Total FAQ items inserted:
-- tickets: 5 items
-- camping: 5 items
-- transport: 4 items
-- children: 4 items
-- food: 4 items
-- safety: 4 items
-- location: 3 items
-- app: 3 items
-- general: 4 items
-- TOTAL: 36 FAQ items
