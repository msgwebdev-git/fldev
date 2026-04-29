
### 05.12.2025 (~6ч)
создал проект на некст, тайпскрипт и tailwind
дальше взяться за eslint, postcss и tsconfig
настроил eslint, postcss и tsconfig, алиас @/* работает
теперь шрифты — подключил Google Fonts через next/font/google: Manrope Variable
указал subsets: latin, cyrillic — кириллица нужна для RO и RU
шрифт работает через font-sans, всё ок
базовый layout.tsx готов, page.tsx рендерится

### 06.12.2025 (~7ч)
поставил shadcn/ui — инициализировал через npx shadcn@latest init
baseColor: neutral, стиль oklch
сразу натащил пачку компонентов: Button, Card, Dialog, Drawer, Sheet, Input, Select, Checkbox, Tabs, Accordion, Badge, Table, DropdownMenu, NavigationMenu, Popover, Tooltip, Separator, Progress, RadioGroup, Switch, Textarea, Alert, Carousel
итого 34 ui-компонента в /src/components/ui/
добавил кастомные PhoneInput и InputGroup — понадобятся для форм
поставил lucide-react для иконок

### 07.12.2025 (~8ч)
взялся за i18n — поставил next-intl
структура роутинга: /src/app/[locale]/ — всё под локалью
две локали: ro (румынский) и ru (русский)
написал middleware.ts — детект локали, редирект
создал /src/i18n/ с конфигом, загрузчиком сообщений
все строки через useTranslations(), ни одной хардкод-строки
контент из БД — поля с суффиксами _ro и _ru, выбираю по текущей локали
навигация через createNavigation из next-intl/navigation
админку решил не локализовать — только русский, нет смысла

### 08.12.2025 (~7ч)
начал собирать основной лейаут
Navbar — фиксированная навигация сверху, переключатель языка (RO/RU), бургер-меню на мобилке
Footer — ссылки на страницы, контакты, соцсети
написал хук useMediaQuery — чтобы отличать десктоп от мобилки
на десктопе юзаю Dialog из shadcn, на мобилке Drawer — более нативный UX
HeroSection — баннер главной страницы, фоновое изображение, CTA-кнопки

### 09.12.2025 (~8ч)
билеты — главная фича сайта
TicketsSection — обёртка, тянет билеты из supabase в Server Component через select() с вложенными ticket_options
TicketCard — карточка отдельного билета: название, цена, описание, фичи
внутри карточки — выбор опций (палатка, парковка, кемпер) и количества
на десктопе опции в Dialog, на мобилке в Drawer — через тот же useMediaQuery
каждая опция — price modifier к базовой цене

### 10.12.2025 (~7ч)
корзина — CartContext через React Context + localStorage
addItem(), removeItem(), updateQuantity(), getItemQuantity(), clearCart()
поддержка лимитов количества на билет
персистенция в localStorage — корзина переживает перезагрузку
добавил флаг isHydrated чтобы не словить SSR/CSR мисмэтч — рендерю корзину только после гидратации
итоги (totalItems, totalPrice) через useMemo
решил не тащить Redux/Zustand — контекста хватает за глаза

### 11.12.2025 (~5ч)
TicketCartBar — плавающая панель корзины внизу экрана
поставил motion (бывший Framer Motion) v12 для анимаций
AnimatePresence для плавного появления/исчезновения панели
spring-физика для движений — выглядит приятно
панель показывает количество билетов и итоговую сумму
кнопка «Оформить» ведёт на /checkout

### 12.12.2025 (~9ч)
страница чекаута — /checkout
поставил react-hook-form + @hookform/resolvers + zod
форма: firstName, lastName, email, phone, промокод
для телефона — react-phone-number-input с валидацией isValidPhoneNumber
чекбоксы: согласие с правилами + маркетинговое согласие
поле промокода — по кнопке отправляет запрос на validatePromo() к серверу
если валидный — показывает скидку и пересчитывает итог
данные корзины подтягиваются из CartContext
отправка заказа — createOrder() POST на Express-сервер
после ответа — редирект на платёжку MAIB

### 13.12.2025 (~6ч)
checkout/success — страница после успешной оплаты
добавил поллинг: каждые 2 секунды дёргаю getOrderTickets()
жду когда все билеты получат pdf_url (значит PDF сгенерились)
как только готовы — показываю кнопку скачивания
поставил canvas-confetti — конфетти при загрузке страницы через motion
checkout/failed — простая страница с сообщением об ошибке и кнопкой «Попробовать снова»
checkout/mock-payment — тестовая страница для разработки, имитирует оплату без MAIB

### 14.12.2025 (~7ч)
галерея — GallerySection
табы по годам (2022, 2023, 2024...) через shadcn Tabs
картинки тянутся из supabase, таблица gallery
lazy loading — подгружаю по мере скролла
лайтбокс — клик на фото открывает полноразмерное изображение
два размера: thumbnail для превью, full для лайтбокса
структура в Supabase Storage: gallery/year/thumbnails/, gallery/year/full/

### 15.12.2025 (~6ч)
AftermovieSection — секция с YouTube-видео, embed-плеер
AppSection и AppCTABlock — CTA блоки для скачивания мобильного приложения
NewsSection — превью последних новостей на главной
/news — страница со списком всех новостей, карточки
/news/[slug] — отдельная новость, контент из БД, rich text

### 16.12.2025 (~8ч)
статические страницы фестиваля:
/about — о фестивале
/lineup — лайнап артистов, данные из supabase
/program — расписание по дням
/contacts — контакты отделов, email, телефон
/how-to-get — как добраться, может быть карта
/rules — правила фестиваля, двуязычные (RO/RU)
/faq — FAQ через shadcn Accordion, вопросы из БД
/activities — активности на фестивале (мастер-классы, зоны)
все страницы двуязычные через next-intl

### 17.12.2025 (~7ч)
/perform — форма заявки от артиста
поля: имя, жанр (селект), ссылки на YouTube/Instagram/SoundCloud, контактные данные
валидация через zod
/partners — страница партнёров + форма заявки
форма партнёра: zod-схема с i18n ключами ошибок
загрузка логотипа с превью — валидация размера и типа файла
отправка через Server Action с FormData — submitPartnerApplication()
на сервере: валидация, загрузка лого в Supabase Storage, запись в БД
уведомления через sonner (тосты)

### 18.12.2025 (~8ч)
/b2b — корпоративные пакеты
B2BPackageCalculator — калькулятор с визуализацией прогрессивных скидок
пороги: 10% от 50 штук, 20% от 100 штук
показывает сколько до следующего порога
B2BOrderWizard — пошаговый мастер: выбор пакета → данные компании → подтверждение
B2BOrderForm — форма с реквизитами компании, выбором метода оплаты (онлайн/инвойс)
react-hook-form + zod для валидации

### 19.12.2025 (~5ч)
MarketingScripts — компонент для инъекции трекинговых скриптов
скрипты хранятся в БД (таблица site_settings): GA4, GTM, Facebook Pixel, TikTok Pixel, Yandex Metrica
инъекция в head и body через dangerouslySetInnerHTML
управляется из админки — маркетологи могут сами менять скрипты
вынес в отдельный компонент чтобы не засорять layout

### 21.12.2025 (~8ч)
начал админку
/admin/login — клиентский компонент, Supabase Auth
signInWithPassword() по email/паролю
при успехе — редирект на /admin
middleware защищает все /admin/* кроме /admin/login
проверка через getUser() — если нет сессии, редирект на логин
сессия хранится в куках через @supabase/ssr
создал три supabase-клиента:
  client.ts — браузерный (anon key)
  server.ts — серверный для Server Components (с куками)
  admin.ts — service role key, обходит RLS

### 23.12.2025 (~7ч)
лейаут админки
AdminSidebar — боковая панель навигации
группы: заказы, контент, маркетинг, настройки
коллапсится на мобилке
дашборд /admin — статистика: количество заказов, выручка, популярные билеты
графики через recharts — линейные и столбчатые диаграммы продаж

### 26.12.2025 (~9ч)
/admin/orders — таблица всех заказов, фильтры по статусу, поиск
/admin/orders/[id] — детальная страница заказа
показывает: данные покупателя, список билетов, статус оплаты, суммы
кнопки действий через B2BOrderActions:
  переотправка билетов — POST /api/admin/orders/[id]/resend-tickets
  возврат — POST /api/admin/orders/[id]/refund
  обновление email — PATCH /api/admin/orders/[id]/update-email
всё через Next.js API routes которые проксируют на Express

### 29.12.2025 (~6ч)
/admin/tickets — управление типами билетов, CRUD
/admin/lineup — лайнап артистов, добавление/редактирование/удаление
/admin/program — расписание по дням, drag-n-drop для порядка
/admin/activities — активности фестиваля
всё работает напрямую с Supabase через серверный клиент
force-dynamic на всех админских страницах для свежих данных

### 02.01.2026 (~9ч)
/admin/news — список новостей, создание, редактирование
/admin/news/new и /admin/news/[id]/edit
RichTextEditor — самая жирная часть
поставил Tiptap (@tiptap/react, @tiptap/starter-kit и кучу расширений)
тулбар: жирный, курсив, подчёркивание, зачёркнутый, код
заголовки h1-h3, списки, выравнивание
вставка ссылок и картинок
подсветка текста
переключение визуальный/HTML режим — для тех кто хочет руками
счётчик слов и символов

### 04.01.2026 (~6ч)
/admin/gallery — управление фотогалереей
мультизагрузка файлов: выбираешь несколько фото
на клиенте сжимаю через browser-image-compression
на сервере конвертирую в WebP через Sharp — два размера (thumbnail + full)
загружаю в Supabase Storage: gallery/year/thumbnails/ и gallery/year/full/
метаданные в таблицу gallery (год, имя файла, порядок)
удаление: чистит и Storage и БД
Next.js API routes: POST /api/admin/gallery/upload, DELETE /api/admin/gallery/delete

### 08.01.2026 (~6ч)
оставшиеся админские страницы:
/admin/faq — CRUD для вопросов/ответов, двуязычные поля
/admin/contacts — управление контактами отделов + просмотр обращений с сайта
/admin/partners — список партнёров, одобрение заявок
всё стандартное: таблицы shadcn, формы, тосты через sonner

### 10.01.2026 (~7ч)
/admin/analytics — аналитика продаж
графики recharts: продажи по дням, по типам билетов, выручка
фильтры по периоду
/admin/promo-codes — управление промокодами
создание: процент или фиксированная сумма, лимит использований, даты действия, лимит на email
таблица с историей использований
/admin/invitations — управление приглашениями, генерация ссылок

### 14.01.2026 (~5ч)
/admin/b2b-orders — таблица B2B-заказов
/admin/b2b-orders/[id] — детали: реквизиты компании, позиции, статус
кнопки: отправить инвойс, подтвердить оплату, отправить билеты
воркфлоу: pending → invoice_sent → paid → tickets_sent → completed
/admin/aftermovies — управление видео aftermovie (ссылки на YouTube)
/admin/settings/marketing — редактирование трекинговых скриптов (GA4, GTM, Pixel, TikTok, Yandex)

### 18.01.2026 (~4ч)
оптимизация и финальные штрихи по фронту
Next.js Image — настроил remotePatterns для YouTube, Instagram, Facebook, Supabase
убедился что все картинки идут через Image с оптимизацией
проверил responsive на всех страницах
почистил unused imports, убрал console.log
всё собирается без ошибок

---

## BACKEND (Express.js сервер)

### 20.01.2026 (~7ч)
создал /server/ — отдельный Express-сервер на TypeScript
npm init, поставил express, typescript, ts-node-dev
настроил tsconfig для сервера, сборка в /server/dist/
создал /server/src/config/index.ts — централизованный конфиг
все env-переменные в одном месте, валидация обязательных в production
PORT, NODE_ENV, FRONTEND_URL, API_URL
SUPABASE_URL, SUPABASE_SERVICE_KEY
MAIB_*, RESEND_*, CRON_*
middleware: requestLogger (метод, URL, статус, время), errorHandler (класс AppError), CORS (только фронтенд-домен), JSON parser + raw body для вебхуков
поставил cors, zod для валидации

### 22.01.2026 (~8ч)
Supabase — проектирование и создание таблиц
orders: order_number, status (pending/ok/failed/expired/refunded), customer_email, customer_first_name, customer_last_name, customer_phone, total_amount, discount_amount, promo_code_id, payment_id, refund_status
order_items: order_id, ticket_id, ticket_option_id, quantity, price, qr_code, pdf_url
tickets: name_ro, name_ru, description_ro, description_ru, price, features (JSON), is_active, display_order
ticket_options: ticket_id, name_ro, name_ru, price, is_active
promo_codes: code, discount_type (percentage/fixed), discount_value, max_uses, current_uses, valid_from, valid_until, max_uses_per_email
настроил RLS-политики:
  public может читать активные билеты
  authenticated (админ) — полный доступ ко всему
  service role — обход RLS для Express-сервера
  anonymous — может отправлять заявки

### 24.01.2026 (~6ч)
дополнительные таблицы:
gallery: year, filename, display_order
contacts, site_contacts: контакты отделов и общие
faq: question_ro, question_ru, answer_ro, answer_ru, category, display_order
activities, festival_rules: контент фестиваля
partnership_requests: заявки на партнёрство
email_logs: лог отправленных писем
site_settings: маркетинговые скрипты
Supabase Storage — бакет gallery для фотографий
всё с RLS, индексы на часто используемых полях

### 26.01.2026 (~9ч)
checkout flow — самая сложная часть
POST /api/checkout/create-order:
  принимает items из корзины + данные покупателя + промокод
  валидирует промокод если есть — проверяет лимиты, даты, использования
  рассчитывает скидку
  создаёт запись в orders и order_items
  генерирует QR-код для каждого order_item (библиотека qrcode)
  отправляет запрос в MAIB на создание платежа
  возвращает redirect URL на платёжный шлюз
поставил axios для запросов к MAIB API

### 28.01.2026 (~8ч)
MAIB интеграция — молдавский банковский шлюз
написал MAIB клиент: создание платежа, проверка статуса, возврат
GET /api/checkout/callback — коллбэк от MAIB после оплаты
  верификация подписи запроса (MAIB_SIGNATURE_KEY)
  обновление статуса заказа в БД
GET /api/checkout/return/ok — редирект клиента на /checkout/success
GET /api/checkout/return/fail — редирект на /checkout/failed
добавил mock-режим (MAIB_MOCK_MODE=true) — для разработки без реального банка
mock сразу ставит статус ok и редиректит
POST /api/maib/callback — альтернативный вебхук

### 30.01.2026 (~8ч)
генерация PDF-билетов
поставил @react-pdf/renderer — генерация PDF на сервере
шаблон билета: название фестиваля, тип билета, имя покупателя, QR-код, правила
QR-код содержит уникальный идентификатор для сканирования на входе
после успешной оплаты генерирую PDF для каждого order_item
сохраняю pdf_url в БД
поставил archiver — для пакетной загрузки (ZIP с несколькими билетами)

### 01.02.2026 (~7ч)
email сервис через Resend
поставил resend, написал email service
шаблон confirmation: HTML с брендовыми стилями, данные заказа, PDF во вложении
base64-иконки для совместимости с почтовыми клиентами
мультиязычность: шаблоны на RO и RU, выбор по локали покупателя
инфо о фестивале: даты, место, что брать, список запрещённых предметов
после генерации PDF — отправляю письмо с билетами
EMAIL_FROM настраивается через env

### 03.02.2026 (~5ч)
промокоды
POST /api/promo/validate — принимает код и сумму
проверяет: существует ли код, не истёк ли, не превышен лимит, не использован этим email
рассчитывает скидку (процент или фиксированная)
возвращает discount_amount и final_amount
при создании заказа — инкрементит current_uses
лимит на email: считает сколько раз этот email уже использовал код

### 05.02.2026 (~6ч)
админские эндпоинты на Express
POST /api/admin/orders/:orderId/resend-tickets — перегенерация и переотправка билетов
POST /api/admin/orders/:orderId/refund — возврат через MAIB API (reversal) + обновление статуса в БД
оба проксируются через Next.js API routes из админки

### 07.02.2026 (~7ч)
крон-задачи через node-cron
три задачи:
1) каждые 15 минут — 1-е напоминание для неоплаченных заказов старше 1 часа
   тема: "Забыли оплатить?" — мягкое напоминание
2) каждый час — 2-е напоминание для заказов старше 24 часов
   тема: "Билеты ещё ждут!" — настойчивое
3) каждый час — экспирация заказов старше 72 часов, статус → expired
шаблоны reminder — HTML, мультиязычные
включение/выключение через ENABLE_CRON_JOBS
часы порогов настраиваются через env

### 09.02.2026 (~8ч)
B2B эндпоинты
POST /api/b2b/calculate-discount — расчёт прогрессивной скидки (10% от 50шт, 20% от 100шт)
POST /api/b2b/create-order — создание B2B-заказа с реквизитами компании
GET /api/b2b/orders/:orderId — детали заказа
PATCH /api/b2b/orders/:orderId — обновление статуса
POST /api/b2b/orders/:orderId/send-invoice — генерация и отправка PDF-инвойса
POST /api/b2b/orders/:orderId/process-payment — проведение оплаты
воркфлоу: pending → invoice_sent → paid → tickets_sent → completed
таблицы: b2b_orders, b2b_order_items, b2b_order_history (аудит через триггеры)

### 12.02.2026 (~6ч)
мобильное API
GET /api/mobile/tickets — активные билеты с опциями
GET /api/mobile/faq — FAQ
GET /api/mobile/app-versions — проверка версий для force update
POST /api/mobile/device-tokens — регистрация пуш-токенов (iOS/Android)
GET /api/mobile/activities — активности
GET /api/mobile/rules — правила
POST /api/mobile/contacts — форма обратной связи
POST /api/mobile/partnerships — заявка на партнёрство
таблицы: device_tokens (platform, token, language), app_versions, push_notifications_log
GET /api/health — healthcheck


