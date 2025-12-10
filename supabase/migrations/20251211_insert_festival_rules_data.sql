-- Migration: Insert festival rules data
-- Date: 2025-12-11
-- Description: Populate festival_rules table with rules in Romanian and Russian

INSERT INTO festival_rules (
  section_id,
  title_ro,
  title_ru,
  icon,
  keywords_ro,
  keywords_ru,
  content_ro,
  content_ru,
  sort_order,
  is_active
) VALUES
  (
    'registration',
    'Înregistrare și brățări',
    'Регистрация и браслеты',
    'Ticket',
    '["bilet", "brățară", "intrare", "înregistrare", "acces", "identificare"]',
    '["билет", "браслет", "вход", "регистрация", "проход", "идентификация"]',
    '[
      "Toți vizitatorii sunt obligați să se înregistreze la intrare și să primească brățara corespunzătoare tipului de bilet achiziționat.",
      "Brățara reprezintă principalul mijloc de identificare pe teritoriul festivalului, iar fiecare participant este responsabil pentru integritatea acesteia.",
      "În cazul deteriorării, pierderii sau modificării brățării, vizitatorul este obligat să se prezinte imediat la punctul de control al biletelor pentru înlocuire, prezentând obligatoriu brățara originală.",
      "Vizitatorii pot părăsi teritoriul festivalului și reveni ulterior, doar cu brățară valabilă."
    ]',
    '[
      "Все посетители обязаны зарегистрироваться при входе и получить браслет соответствующий типу приобретённого билета.",
      "Браслет является основным средством идентификации на территории фестиваля, каждый участник несёт ответственность за его сохранность.",
      "В случае повреждения, потери или изменения браслета посетитель обязан немедленно обратиться в пункт контроля билетов для замены, обязательно предъявив оригинальный браслет.",
      "Посетители могут покидать территорию фестиваля и возвращаться только при наличии действительного браслета."
    ]',
    1,
    true
  ),
  (
    'security',
    'Control de securitate',
    'Контроль безопасности',
    'ShieldCheck',
    '["securitate", "pază", "control", "verificare", "medical", "ajutor"]',
    '["безопасность", "охрана", "проверка", "досмотр", "медицина", "помощь"]',
    '[
      "La intrarea pe teritoriul festivalului fiecare vizitator este supus controlului de securitate pentru depistarea obiectelor și substanțelor interzise.",
      "Organizatorii roagă vizitatorii să fie înțelegători — măsura este necesară pentru asigurarea siguranței tuturor participanților.",
      "Paza și serviciile medicale sunt disponibile 24/7 pe teritoriul festivalului."
    ]',
    '[
      "При входе на территорию фестиваля каждый посетитель подвергается проверке безопасности для выявления запрещённых предметов и веществ.",
      "Организаторы просят посетителей проявить понимание — эта мера необходима для обеспечения безопасности всех участников.",
      "Охрана и медицинские службы работают круглосуточно на территории фестиваля."
    ]',
    2,
    true
  ),
  (
    'general',
    'Reguli generale',
    'Общие правила',
    'Users',
    '["gunoi", "fumat", "natură", "rezervație", "reguli", "comportament"]',
    '["мусор", "курение", "природа", "заповедник", "правила", "поведение"]',
    '[
      "Toate deșeurile trebuie aruncate doar în containerele special amenajate.",
      "Fumatul este permis exclusiv în zonele desemnate.",
      "Festivalul are loc într-o rezervație naturală — vizitatorii își asumă orice risc asociat mediului natural."
    ]',
    '[
      "Все отходы следует выбрасывать только в специально оборудованные контейнеры.",
      "Курение разрешено исключительно в отведённых для этого зонах.",
      "Фестиваль проходит на территории природного заповедника — посетители принимают на себя все риски, связанные с природной средой."
    ]',
    3,
    true
  ),
  (
    'prohibited',
    'Obiecte și substanțe interzise',
    'Запрещённые предметы и вещества',
    'Ban',
    '["alcool", "mâncare", "apă", "arme", "droguri", "interzis", "pirotehnice", "dronă", "medicamente", "spray"]',
    '["алкоголь", "еда", "вода", "оружие", "наркотики", "запрещено", "нельзя", "пиротехника", "дрон", "лекарства", "спрей"]',
    '[
      "Este strict interzis accesul cu:",
      "• Băuturi alcoolice sau slab alcoolice în orice recipient",
      "• Produse alimentare și băuturi, cu excepția apei plate",
      "Excepții permise:",
      "• Alimente pentru copii",
      "• Produse dietetice prescrise medical (cu dovadă medicală)",
      "• Arme de orice tip (de foc, pneumatic, cu gaz, arme albe)",
      "• Substanțe explozive, artificii și articole pirotehnice",
      "• Lămpi cu combustibil, arzătoare, grătare, butelii, lichide inflamabile",
      "• Spray-uri aerosol, deodorante, repelente, produse pentru coafat",
      "• Obiecte tăioase sau periculoase",
      "• Lasere, generatoare, megafoane",
      "• Substanțe narcotice",
      "• Medicamente, cu excepția celor vitale, antialergice și soluții pentru lentile (în ambalaj original sigilat)",
      "• Drone și quadcoptere"
    ]',
    '[
      "Строго запрещён вход с:",
      "• Алкогольными или слабоалкогольными напитками в любой таре",
      "• Продуктами питания и напитками, за исключением негазированной воды",
      "Разрешённые исключения:",
      "• Детское питание",
      "• Диетические продукты по медицинским показаниям (с документальным подтверждением)",
      "• Оружием любого типа (огнестрельным, пневматическим, газовым, холодным)",
      "• Взрывчатыми веществами, фейерверками и пиротехникой",
      "• Лампами на горючем, горелками, мангалами, баллонами, легковоспламеняющимися жидкостями",
      "• Аэрозольными спреями, дезодорантами, репеллентами, средствами для укладки",
      "• Острыми или опасными предметами",
      "• Лазерами, генераторами, мегафонами",
      "• Наркотическими веществами",
      "• Медикаментами, за исключением жизненно необходимых, противоаллергических и растворов для линз (в оригинальной запечатанной упаковке)",
      "• Дронами и квадрокоптерами"
    ]',
    4,
    true
  ),
  (
    'forbidden-actions',
    'Este interzis pe teritoriul festivalului',
    'Запрещено на территории фестиваля',
    'AlertTriangle',
    '["gard", "foc", "cort", "publicitate", "comerț", "vandalism"]',
    '["забор", "костёр", "огонь", "палатка", "реклама", "торговля", "вандализм"]',
    '[
      "• Accesul fără brățara valabilă",
      "• Escaladarea gardurilor, structurilor și arborilor",
      "• Distrugerea echipamentului și decorurilor",
      "• Intervenția în activitatea tehnică",
      "• Aprinderea oricărei forme de foc",
      "• Instalarea corturilor în afara campingului sau parcării",
      "• Activități promoționale neautorizate",
      "• Comerț ilegal",
      "• Accesul în zonele restricționate",
      "• Vandalismul și tulburarea ordinii publice"
    ]',
    '[
      "• Проход без действительного браслета",
      "• Перелезание через заборы, конструкции и деревья",
      "• Повреждение оборудования и декораций",
      "• Вмешательство в техническую работу",
      "• Разведение огня в любой форме",
      "• Установка палаток за пределами кемпинга или парковки",
      "• Несанкционированная рекламная деятельность",
      "• Незаконная торговля",
      "• Проход в закрытые зоны",
      "• Вандализм и нарушение общественного порядка"
    ]',
    5,
    true
  ),
  (
    'liability',
    'Responsabilitatea organizatorilor',
    'Ответственность организаторов',
    'Package',
    '["bunuri", "cort", "mașină", "responsabilitate", "obiecte"]',
    '["вещи", "палатка", "машина", "ответственность", "имущество"]',
    '[
      "Organizatorii nu sunt responsabili pentru:",
      "• Siguranța corturilor și bunurilor din interior",
      "• Daune aduse vehiculelor parcate",
      "• Obiecte personale lăsate nesupravegheate"
    ]',
    '[
      "Организаторы не несут ответственности за:",
      "• Сохранность палаток и вещей внутри них",
      "• Повреждения транспортных средств на парковке",
      "• Личные вещи, оставленные без присмотра"
    ]',
    6,
    true
  ),
  (
    'transport',
    'Transport personal',
    'Личный транспорт',
    'Car',
    '["parcare", "mașină", "motocicletă", "automobil", "transport"]',
    '["парковка", "машина", "мотоцикл", "автомобиль", "транспорт"]',
    '[
      "Parcarea este gratuită pentru automobile și motociclete.",
      "La accesul în zona camping, toți ocupanții vehiculului trebuie să prezinte bilete valabile pentru camping.",
      "Vehiculele vor fi supuse controlului de securitate."
    ]',
    '[
      "Парковка бесплатна для автомобилей и мотоциклов.",
      "При въезде в зону кемпинга все пассажиры транспортного средства должны предъявить действительные билеты на кемпинг.",
      "Транспортные средства подвергаются проверке безопасности."
    ]',
    7,
    true
  ),
  (
    'children',
    'Copii',
    'Дети',
    'Baby',
    '["copii", "copil", "părinți", "documente", "vârstă", "familie"]',
    '["дети", "ребёнок", "родители", "документы", "возраст", "семья"]',
    '[
      "• Accesul copiilor sub 14 ani este permis doar cu părinți",
      "• Este necesar un document de identitate și certificat de naștere (copie)",
      "• Copiii sub 7 ani au intrare gratuită",
      "• De la 7 ani este obligatoriu biletul",
      "Fără documente — accesul poate fi refuzat."
    ]',
    '[
      "• Дети до 14 лет допускаются только в сопровождении родителей",
      "• Необходим документ, удостоверяющий личность, и свидетельство о рождении (копия)",
      "• Дети до 7 лет — вход бесплатный",
      "• С 7 лет обязательно наличие билета",
      "Без документов — вход может быть отказан."
    ]',
    8,
    true
  ),
  (
    'camping',
    'Regulament camping',
    'Правила кемпинга',
    'Tent',
    '["camping", "cort", "family", "liniște", "duș", "toaletă"]',
    '["кемпинг", "палатка", "camping", "семейный", "тишина", "душ", "туалет"]',
    '[
      "• Campingul este permis numai în zonele autorizate",
      "• Accesul și instalarea corturilor: 09 august 2024, ora 18:00",
      "• FAMILY CAMPING este zonă de liniște între 23:00 – 07:00",
      "• Curățenia este responsabilitatea fiecărui participant",
      "• Deșeurile se aruncă doar în spațiile special amenajate",
      "• Grupurile sanitare trebuie utilizate responsabil",
      "• Demontarea corturilor — până pe 12 august la ora 12:00",
      "• Locul trebuie lăsat curat și fără obiecte"
    ]',
    '[
      "• Кемпинг разрешён только в специально отведённых зонах",
      "• Въезд и установка палаток: 09 августа 2024, с 18:00",
      "• FAMILY CAMPING — зона тишины с 23:00 до 07:00",
      "• Чистота — ответственность каждого участника",
      "• Мусор выбрасывается только в специально оборудованных местах",
      "• Санитарные группы должны использоваться ответственно",
      "• Демонтаж палаток — до 12 августа, 12:00",
      "• Место необходимо оставить чистым и без вещей"
    ]',
    9,
    true
  ),
  (
    'photo',
    'Foto și video',
    'Фото и видео',
    'Camera',
    '["foto", "video", "filmare", "cameră", "acord"]',
    '["фото", "видео", "съёмка", "камера", "согласие"]',
    '[
      "Prin achiziționarea biletului, vizitatorul își dă acordul pentru utilizarea imaginilor foto/video/audio în scopuri promoționale de către organizatori."
    ]',
    '[
      "Приобретая билет, посетитель даёт согласие на использование фото/видео/аудио материалов с его участием в промо-целях организаторов."
    ]',
    10,
    true
  );
