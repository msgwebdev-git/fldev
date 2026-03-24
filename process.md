# FL Festival — Process Log

## Что сделано

### 1. Мобильное приложение (fl-mobile-app)

#### API URL
- Заменён Railway URL на `https://api.festivalul-lupilor.md`

#### Splash Screen
- Убраны частицы, круги, shimmer, gradient
- Чистый splash: логотип + дата + локация на тёмном фоне
- Логотип берётся из `assets/images/logo.png`
- Fade + scale анимация, 2 сек → auth check → home

#### Цвета и градиенты
- Primary color заменён: `#E54D2E` → `#EF490B`
- Убраны ВСЕ градиенты из 25+ файлов (замена на solid colors)
- `festivalGradient` и `primaryGradient` удалены из AppColors
- Fallback фон на home screen: оранжевый → `AppColors.background` (тёмный)

#### Notifications UI
- Переписан notifications page: группировка по дате (Today/Yesterday/Earlier)
- Swipe-to-dismiss с персистентностью (не возвращается после перезапуска)
- Иконки единого цвета (primary для unread, muted для read), без цветных bg
- Tap на уведомление → навигация на actionRoute через GoRouter

#### Push Notifications (Flutter)
- Firebase подключен: `firebase_options.dart`, `google-services.json`, `GoogleService-Info.plist`
- `PushNotificationService` — singleton, FCM init, token registration, foreground display
- `setAutoInitEnabled(false)` — FCM не регистрируется до consent пользователя (App Store/Google Play safe)
- Pre-permission bottom sheet "Stay updated" — показывается 1 раз на home
- Settings toggle реально подключён к FCM (enable → requestPermission, disable → unregister)
- `notificationsEnabled` default `false`, читает реальный статус FCM при загрузке
- Background messages обрабатываются
- iOS: `provisional: true`, background modes в Info.plist
- Android: `POST_NOTIFICATIONS` permission, notification channel `festival_notifications`
- Язык при регистрации токена берётся из SharedPreferences (не хардкод)
- Badge очищается при открытии notifications page

#### Notifications BLoC
- Убраны мок данные — загрузка с сервера `GET /api/mobile/notifications`
- Локальный кэш в SharedPreferences (offline support)
- Read/unread state хранится локально (`_readIds`)
- Dismissed IDs персистентны (`_dismissedIds`)
- Install date filter — новый юзер не видит старые уведомления
- Server → local merge: если сервер доступен — синхронизация, если нет — кэш
- `_readIds` trimming — не растёт бесконечно
- Static Dio instance — без лишних аллокаций

---

### 2. Сервер (fl-site/server)

#### Push Service (`src/services/push.ts`)
- `firebase-admin` установлен и настроен
- `sendToAll()` — локализованная отправка: группирует устройства по language, каждая группа получает текст на своём языке (ro/ru)
- `sendToDevice()` — отправка на конкретный токен с выбором языка
- Fallback: если ru текст пустой → отправляется ro
- Автоматическая очистка stale FCM tokens
- Батч отправка по 500 токенов (лимит FCM)
- `saveToHistory()` — fire-and-forget запись в `push_notifications`
- `getDeviceCount()` — Promise.all для параллельных запросов
- `getHistory()` — история отправок

#### Admin Endpoints
- `POST /api/admin/notifications/send` — отправка push (titleRo, bodyRo, titleRu?, bodyRu?, type, actionRoute)
- `GET /api/admin/notifications/stats` — статистика устройств + история
- Zod validation на входе

#### Mobile Endpoint
- `GET /api/mobile/notifications?locale=ro&limit=20` — локализованная история уведомлений

#### Config
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` в env

---

### 3. Admin Panel (fl-site, Next.js)

#### Push Notifications Page (`/admin/notifications`)
- Форма отправки с двумя языками: 🇷🇴 Română (обязательно) + 🇷🇺 Русский (опционально)
- Статистика устройств (total / iOS / Android)
- История отправок с ru preview
- API route `/api/admin/notifications` — proxy к серверу с auth check
- Sidebar: новая секция "Коммуникация" с "Push-уведомления"

---

### 4. Firebase
- Проект: `festivalul-lupilor-app`
- APNs .p8 ключ загружен в Firebase Console
- Service Account credentials в Railway env
- `flutterfire configure` выполнен (Android + iOS)

### 5. Supabase
- Таблица `push_notifications` создана
- Таблица `device_tokens` уже существовала

---

## Где остановились

### Последнее действие:
Добавлена локализация push уведомлений (ro/ru). Нужно выполнить SQL в Supabase:

```sql
ALTER TABLE public.push_notifications
ADD COLUMN IF NOT EXISTS title_ru text,
ADD COLUMN IF NOT EXISTS body_ru text;
```

### Что не сделано / можно улучшить:
- [ ] Выполнить SQL для `title_ru` / `body_ru` колонок в Supabase
- [ ] Задеплоить сервер на Railway (push service + localized endpoints)
- [ ] Задеплоить admin panel (notifications page)
- [ ] Тест push на реальном iOS устройстве (симулятор не поддерживает push)
- [ ] Scheduled push через cron (напоминание за день до фестиваля)
- [ ] Notification tap deep link для detail pages (news/:slug, orders/:id)
- [ ] Android notification icon (кастомный вместо launcher icon)
- [ ] Локализация pre-permission sheet ("Stay updated" → перевод на ro/ru)
