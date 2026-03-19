# PWA Офлайн-сканер билетов

## Контекст

На фестивале 5000-15000 человек проходят через ворота. Интернет на площадке может пропасть. Нужно приложение для Android, которое сканирует QR-коды билетов и работает без интернета. Решение — PWA (Progressive Web App): открыл ссылку в Chrome → "Добавить на главный экран" → работает как приложение.

> **iOS**: html5-qrcode поддерживает камеру только на iOS >= 15.1 (ограничение WebKit). Android — основная платформа.

## Архитектура

Сканер — **отдельное Vite + React приложение**, живёт на поддомене `scanner.example.com`. Общается **напрямую** с Express сервером. Никакого Next.js-прокси.

```
scanner.example.com (Vite PWA)     api.example.com (Express)
┌────────────────────────────┐     ┌─────────────────────────────────┐
│  ScannerApp.tsx            │     │                                 │
│    ├── scanner-db.ts (IDB) │     │  POST /api/scan/auth            │
│    ├── scanner-sync.ts ────┼────▶│  GET  /api/scan/manifest        │
│    └── html5-qrcode        │     │  POST /api/scan/batch           │
│                            │     │                                 │
│  Service Worker (offline)  │     │  scannerAuth middleware          │
│  IndexedDB (15K билетов)   │     │  (проверяет signed token)       │
└────────────────────────────┘     └─────────────────────────────────┘
```

### Почему отдельный проект, а не Next.js страница

- **Отдельный поддомен** — требование, Next.js app не может обслуживать чужой домен
- **Легче bundle** — Vite PWA ~50KB vs Next.js ~200KB+, критично для первой загрузки на плохом интернете
- **Проще service worker** — нет конфликтов с Next.js runtime
- **Независимый деплой** — обновляем сканер не трогая основной сайт
- **Нет прокси-слоя** — scanner → Express напрямую, меньше точек отказа

### Размещение проекта

```
fl-site/
├── scanner/              ← ОТДЕЛЬНЫЙ Vite-проект, свой git-репозиторий
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/               ← Express (тоже свой git-репо, уже в .gitignore)
├── src/                  ← Next.js фронтенд
├── .gitignore            ← содержит /scanner
└── ...
```

`/scanner` добавлен в `.gitignore` основного репо — не коммитится с фронтендом.

## Файловая структура

### Новый проект: `scanner/`

```
scanner/
├── public/
│   ├── manifest.json              — PWA манифест
│   ├── sw.js                      — Service Worker (vanilla JS)
│   ├── icon-192.png               — иконка PWA
│   └── icon-512.png               — иконка PWA
├── src/
│   ├── main.tsx                   — точка входа React
│   ├── App.tsx                    — роутинг по экранам (state machine)
│   ├── screens/
│   │   ├── PinScreen.tsx          — экран ввода PIN
│   │   ├── DashboardScreen.tsx    — статистика + кнопка "СКАНИРОВАТЬ"
│   │   ├── CameraScreen.tsx       — html5-qrcode видоискатель
│   │   └── ResultScreen.tsx       — зелёный/жёлтый/красный результат
│   ├── lib/
│   │   ├── scanner-db.ts          — IndexedDB обёртка (через idb)
│   │   ├── scanner-sync.ts        — синхронизация с Express
│   │   ├── api.ts                 — HTTP-клиент к Express (fetch + token)
│   │   └── config.ts              — API_URL из env
│   ├── index.css                  — Tailwind CSS
│   └── vite-env.d.ts
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Изменяемые файлы в `fl-site/server/`

```
server/src/config/index.ts           — добавить SCANNER_PIN, SCANNER_SECRET, SCANNER_URL
server/src/middleware/auth.ts         — добавить scannerAuth middleware
server/src/routes/scan.ts            — добавить POST /auth, GET /manifest, POST /batch
server/src/services/scan.ts          — добавить batchCheckin() метод
server/src/services/ticket-cache.ts  — добавить qrData в CachedTicket, getAll(), исправить id
server/src/index.ts                  — CORS для scanner-домена
```

### Изменяемые файлы в `fl-site/`

```
.gitignore                           — добавить /scanner
```

> **Не трогаем**: `src/middleware.ts`, `src/app/`, `package.json` основного фронтенда.

## Аутентификация

PIN-код (4-6 цифр), задаётся в env Express-сервера как `SCANNER_PIN`. Охранникам сообщается устно утром.

### Stateless signed token

HMAC-signed token, проверяется на Express. Не зависит от рестартов.

```
Формат: base64url(JSON({ dev, iat, exp })) + "." + HMAC-SHA256(payload, SCANNER_SECRET)

Пример payload: { "dev": "Ворота A", "iat": 1711000000, "exp": 1711172800 }
```

`SCANNER_SECRET` — отдельный env, не `ADMIN_API_KEY` и не `TICKET_HMAC_SECRET`.

### Поток

1. Охранник открывает `scanner.example.com` — устройству автоматически присваивается `SCAN-XXXX` (4 hex символа из `crypto.randomUUID()`, хранится в localStorage навсегда)
2. Охранник вводит PIN. Поле устройства — read-only, показывает `SCAN-XXXX`
3. `POST /api/scan/auth { pin, deviceId: "SCAN-7F3A" }` → Express проверяет PIN, генерирует signed token (48h) с `did: "SCAN-7F3A"`
4. Токен сохраняется в `localStorage`
5. Все запросы к `/api/scan/*` идут с `Authorization: Bearer <token>`
6. Express `scannerAuth` middleware верифицирует подпись + проверяет `exp` + извлекает `did`
7. Все check-ins логируются с `deviceId` — для статистики по устройствам в админке
8. При 401 от сервера — показать экран re-login

### Endpoint: POST /api/scan/auth

```
Вход:  { pin: "123456", deviceName: "Ворота A" }
Выход: { success: true, data: { token: "eyJkZXYiOi....<signature>" } }
Ошибка: 401 { success: false, error: "Invalid PIN" }
```

- Не требует никакого токена (это сам auth)
- Rate limit: 5 попыток/мин/IP (защита от перебора)
- PIN сверяется через constant-time сравнение

### Middleware: scannerAuth

```typescript
// server/src/middleware/auth.ts — новый export
export function scannerAuth(req, res, next) {
  const header = req.headers.authorization;             // "Bearer <token>"
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Missing token', 401));

  const dotIndex = token.lastIndexOf('.');
  const payload = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  // Verify HMAC
  const expected = hmac(payload, config.scannerSecret);
  if (!timingSafeEqual(sig, expected)) return next(new AppError('Invalid token', 401));

  // Check expiry
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (Date.now() / 1000 > data.exp) return next(new AppError('Token expired', 401));

  req.scannerDevice = data.dev;   // "Ворота A" — для логов и scannedBy
  next();
}
```

### Env переменные (server/.env)

```
SCANNER_PIN=123456
SCANNER_SECRET=<random 32+ chars, отличается от TICKET_HMAC_SECRET>
SCANNER_URL=https://scanner.example.com
```

## CORS

Текущий Express CORS пускает только `config.frontendUrl`. Нужно добавить scanner-домен.

```typescript
// server/src/index.ts
const allowedOrigins = [config.frontendUrl, config.scannerUrl].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('CORS'));
  },
  credentials: true,
}));
```

## IndexedDB схема (через библиотеку `idb`)

```typescript
// scanner/src/lib/scanner-db.ts
import { openDB, type DBSchema } from 'idb';

interface ScannerDB extends DBSchema {
  tickets: {
    key: string;                   // qrData (CODE.SIGNATURE)
    value: {
      qrData: string;
      ticketCode: string;
      customerName: string;
      ticketName: string;
      optionName: string | null;
      orderNumber: string;
      isInvitation: boolean;
      checkedInAt: string | null;
      checkedInBy: string | null;
    };
  };
  pendingCheckins: {
    key: number;                   // auto-increment
    value: {
      qrData: string;
      scannedBy: string;
      scannedAt: string;           // ISO — реальное время скана на устройстве
      synced: number;              // 0 = pending, 1 = synced (boolean НЕ валидный IDB ключ!)
    };
    indexes: {
      'by-synced': number;
    };
  };
}

const DB_NAME = 'festival-scanner';
const DB_VERSION = 1;

export function getDB() {
  return openDB<ScannerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tickets')) {
        db.createObjectStore('tickets', { keyPath: 'qrData' });
      }
      if (!db.objectStoreNames.contains('pendingCheckins')) {
        const store = db.createObjectStore('pendingCheckins', {
          keyPath: 'id',              // добавим явный id
          autoIncrement: true,
        });
        store.createIndex('by-synced', 'synced');
      }
    },
  });
}
```

15 000 билетов ≈ 3 MB — в пределах лимита IndexedDB.

### Ключ — `qrData` (полная строка CODE.SIGNATURE)

Камера считывает полную строку. Устройство ищет в IndexedDB по ней.
Сервер в manifest отдаёт `qr_data` из БД (поле существует в обеих таблицах).

## Синхронизация

### Загрузка билетов (manifest)

При активации + каждые 5 мин (если онлайн):
- `GET /api/scan/manifest` → массив всех валидных билетов → upsert в IndexedDB
- Новые билеты добавляются, существующие обновляются (если check-in с другого устройства)
- Определение online: по факту успешного fetch, **не** по `navigator.onLine` (ненадёжно)

### Отправка check-ins (batch sync)

Каждые 10 сек (если онлайн):
- Все записи из `pendingCheckins` где `synced === false`
- `POST /api/scan/batch` → пакетная отправка (макс 50 за раз)
- Сервер возвращает массив результатов:
  - `{ qrData, status: "ok" }` — записано
  - `{ qrData, status: "already_checked_in", checkedInAt, checkedInBy }` — дубликат
  - `{ qrData, status: "invalid" }` — невалидная подпись
  - `{ qrData, status: "not_found" }` — билет не найден в кеше
- Успешные (ok + already_checked_in) → `synced = true`
- `invalid` → логируется как инцидент безопасности

### Конфликт двух устройств

Два устройства сканировали один билет офлайн. Оба показали зелёный. При sync:
- Первый → `ok` (записался в БД)
- Второй → `already_checked_in` (человек уже прошёл — это нормально)

## Безопасность

- HMAC-секрет (`TICKET_HMAC_SECRET`) **не отправляется** на устройство
- Сервер отдаёт список валидных `qrData` (CODE.SIGNATURE пар) — устройство просто делает lookup
- **Batch endpoint проверяет HMAC-подпись** каждого qrData — defense in depth
- PIN + signed token для аутентификации (отдельный `SCANNER_SECRET`)
- `ADMIN_API_KEY` **не участвует** — scanner-эндпоинты используют свой auth
- CORS ограничивает доступ только `SCANNER_URL`
- Rate limit на auth: 5/мин/IP (анти-брутфорс PIN)
- Rate limit на scan/batch: 300/мин/device

## UI (4 экрана, одна страница)

1. **PIN-вход** — тёмный фон, поле PIN, имя устройства, кнопка "Активировать"
2. **Дашборд** — статус связи (зелёный/красный по факту последнего fetch), кол-во билетов в базе, кол-во check-ins, pending sync, кнопка "СКАНИРОВАТЬ"
3. **Камера** — полноэкранный видоискатель (html5-qrcode), кнопка назад
4. **Результат** (3 сек, потом автовозврат к камере):
   - ЗЕЛЁНЫЙ: "Проходи!" + имя + тип билета (вибрация 200ms)
   - ЖЁЛТЫЙ: "Уже прошёл!" + время check-in + кто сканировал (вибрация [200, 100, 200])
   - КРАСНЫЙ: "Недействителен!" (вибрация [200, 100, 200, 100, 200])

### Технические решения UI

- **html5-qrcode**: low-level `Html5Qrcode` API (не `Html5QrcodeScanner`). Полный контроль над камерой.
- **Только QR_CODE**: `formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]` — быстрее, нет ложных срабатываний.
- **fps: 10** — баланс скорости и батареи.
- **facingMode: "environment"** — задняя камера по умолчанию.
- **Pause/resume**: после скана — `pause(false)` (камера видна, сканер стоит), через 3 сек — `resume()`. Не stop/start — не переспрашивает разрешения камеры.
- **Wake Lock API**: `navigator.wakeLock.request('screen')` при сканировании, чтобы экран не гас.
- **Vibration API**: `navigator.vibrate()` с fallback.
- **React useEffect cleanup**: при unmount — `stop().then(() => clear())`.

## Service Worker

```javascript
// scanner/public/sw.js
const CACHE_NAME = 'scanner-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API — всегда сеть, никогда не кешируем данные
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // App shell — cache-first, потом сеть
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

> Scope по умолчанию `/` — всё приложение. Сканер живёт на отдельном домене, конфликтов нет.

## Express сервер — изменения

### 1. Config: `server/src/config/index.ts`

Добавить:

```typescript
// Scanner
scannerPin: process.env.SCANNER_PIN || '',
scannerSecret: process.env.SCANNER_SECRET || '',
scannerUrl: (process.env.SCANNER_URL || '').replace(/\/$/, ''),
```

### 2. Auth middleware: `server/src/middleware/auth.ts`

Новый export `scannerAuth` — проверяет signed token (описан выше).

### 3. Ticket cache: `server/src/services/ticket-cache.ts`

- Добавить `qrData: string` в `CachedTicket` — загружать `qr_data` из обеих таблиц
- Исправить `id: number` → `id: string` (uuid в БД)
- Добавить `getAll()` — возвращает массив для manifest
- Обновить `checkIn(ticketCode, scannedBy?, checkedInAt?)` — принимать клиентское время

### 4. Scan service: `server/src/services/scan.ts`

Новый метод `batchCheckin()`:

```typescript
interface BatchCheckinItem {
  qrData: string;
  scannedBy: string;
  scannedAt: string;     // ISO от клиента
}

interface BatchCheckinResult {
  qrData: string;
  status: 'ok' | 'already_checked_in' | 'invalid' | 'not_found';
  checkedInAt?: string;
  checkedInBy?: string;
}

async batchCheckin(items: BatchCheckinItem[]): Promise<BatchCheckinResult[]> {
  return items.map(({ qrData, scannedBy, scannedAt }) => {
    // 1. Parse QR
    const parsed = parseQRData(qrData);
    if (!parsed) return { qrData, status: 'invalid' };

    // 2. Verify HMAC — defense in depth
    if (!verifyTicketSignature(parsed.code, parsed.sig))
      return { qrData, status: 'invalid' };

    // 3. Lookup in cache
    const ticket = ticketCache.get(parsed.code);
    if (!ticket) return { qrData, status: 'not_found' };

    // 4. Already checked in?
    if (ticket.checkedInAt)
      return { qrData, status: 'already_checked_in',
               checkedInAt: ticket.checkedInAt, checkedInBy: ticket.checkedInBy };

    // 5. Check in with client timestamp
    ticketCache.checkIn(parsed.code, scannedBy, scannedAt);
    return { qrData, status: 'ok' };
  });
}
```

**Не бросает ошибки.** Каждый элемент — отдельный результат в массиве.

### 5. Scan routes: `server/src/routes/scan.ts`

```
POST /api/scan/auth         — открытый, rate limit 5/мин
GET  /api/scan/manifest     — scannerAuth, rate limit 12/мин
POST /api/scan/batch        — scannerAuth, rate limit 300/мин
```

Существующие эндпоинты (`POST /`, `GET /stats`, etc.) остаются на `apiKeyAuth` — для админки.

### 6. CORS: `server/src/index.ts`

Расширить origin на массив: `[config.frontendUrl, config.scannerUrl]`.

### 7. Rate limiting: `server/src/index.ts`

```typescript
const scannerAuthLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  message: { success: false, error: 'Too many auth attempts' },
});
app.use('/api/scan/auth', scannerAuthLimiter);
```

## Vite-проект: `scanner/`

### package.json (ключевые зависимости)

```json
{
  "name": "fl-scanner",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "html5-qrcode": "^2.3.8",
    "idb": "^8.0.2"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite": "^6"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,    // dev-сервер, не конфликтует с Next.js (3000) и Express (3001)
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3001'
    ),
  },
});
```

### Env

```
# scanner/.env
VITE_API_URL=https://api.example.com
```

## Порядок реализации

### Фаза 1: Express бэкенд (server/) — DONE

1. [x] **config/index.ts** — добавлены `scannerPin`, `scannerSecret`, `scannerUrl`
2. [x] **middleware/auth.ts** — добавлен `scannerAuth` middleware (HMAC-signed token, проверка exp, constant-time compare, проверка пустого secret)
3. [x] **ticket-cache.ts** — `qrData` в CachedTicket, `qr_data` в обоих select + realtime handler, `id: string`, `getAll()`, `checkIn()` с опциональным `checkedInAt`
4. [x] **services/scan.ts** — добавлен `batchCheckin()`: HMAC-проверка, no-throw, client timestamp
5. [x] **routes/scan.ts** — `POST /auth` (PIN→token), `GET /manifest` (scannerAuth), `POST /batch` (scannerAuth)
6. [x] **index.ts** — CORS multi-origin, `scannerAuthLimiter` 5/мин на `/api/scan/auth`

> Ревью: исправлен `require('crypto')` → static import, добавлена проверка пустого `scannerSecret`

### Фаза 2: Scaffold Vite-проекта (scanner/) — DONE

7. [x] Vite + React 19 + TypeScript, порт 3002
8. [x] Tailwind CSS v4 через `@tailwindcss/vite`
9. [x] `scanner/.env` с `VITE_API_URL=http://localhost:3001`

### Фаза 3: Клиентская логика (scanner/src/lib/) — DONE

10. [x] **config.ts** — `API_URL` из `import.meta.env.VITE_API_URL`
11. [x] **api.ts** — `scannerFetch()`: token injection, 401 → event → re-login
12. [x] **scanner-db.ts** — IndexedDB через `idb`: getDB, upsertTickets, getTicket, localCheckIn, getPendingCheckins, markSynced, getTicketCount, getCheckedInCount
13. [x] **scanner-sync.ts** — syncManifest (5 мин), syncCheckins (10 сек), isOnline по fetch

> Ревью: исправлен `synced: boolean` → `synced: number (0|1)` — boolean не валидный IDB ключ, индекс не работал бы. Экспортирован тип `Ticket`.

### Фаза 4: UI (scanner/src/screens/) — DONE

14. [x] **App.tsx** — state machine: `pin → dashboard → camera` (3 экрана, result = overlay в CameraScreen)
15. [x] **PinScreen.tsx** — PIN + device name → POST /auth → save token в localStorage
16. [x] **DashboardScreen.tsx** — online/offline, ticket count, checkin count, pending (refresh 3 сек), startSync() на mount
17. [x] **CameraScreen.tsx** — html5-qrcode (low-level API), pause/resume, Wake Lock, результат как overlay (3 сек → auto-resume). Tap для раннего dismiss.
18. [x] ~~ResultScreen.tsx~~ — встроен в CameraScreen как overlay. Отдельный файл удалён.

> Ревью: исправлен баг `json.token` → `json.data.token` в PinScreen (токен не сохранялся).
> Рефакторинг: результат показывается как overlay внутри CameraScreen. Камера не перемонтируется между сканами — pause/resume вместо stop/start. Нет ~1 сек задержки на перезапуск камеры.

### Фаза 5: PWA — DONE

19. [x] **public/manifest.json** — name, icons, display: standalone, start_url: /, theme_color: #030712
20. [x] **public/sw.js** — cache-first + cache-on-fetch для JS/CSS бандлов, network-only для API/cross-origin
21. [x] **index.html** — PWA meta tags, manifest link, apple-touch-icon, SW registration в main.tsx
22. [x] **Иконки** — icon-192.png (192×192, RGBA), icon-512.png (512×512, RGBA)

> Ревью: исправлен SW — добавлен cache-on-fetch (JS/CSS бандлы с хешами не кешировались → приложение не работало офлайн). Удалены артефакты шаблона (favicon.svg, icons.svg). Favicon заменён на icon-192.png + apple-touch-icon.

### Фаза 6: Интеграция — DONE

23. [x] **.gitignore** — `/scanner` добавлен
24. [ ] Проверка: dev-режим scanner (3002) → Express (3001) → Supabase

## Проверка

### Функциональные тесты

1. Открыть scanner на телефоне → ввести PIN → билеты загрузились (дашборд: N билетов)
2. Сканировать QR → зелёный, билет помечен, check-ins +1
3. Тот же QR → жёлтый ("Уже прошёл в HH:MM")
4. Несуществующий QR → красный
5. Выключить интернет → сканировать новый QR → работает, pending +1
6. Включить интернет → pending sync'd (pending → 0)
7. Проверить в админке → check-ins с правильным временем (офлайн-время, не время sync)
8. Два устройства: оба офлайн, один билет → оба зелёные → sync: один ok, другой already_checked_in

### PWA тесты

9. "Добавить на главный экран" → standalone приложение
10. Закрыть браузер → иконка на столе → работает
11. Авиарежим → приложение открывается, сканирование работает

### Edge cases

12. Неправильный PIN → 401, не пускает
13. Токен истёк → автоматический re-login экран
14. Manifest 503 (кеш не готов) → retry через 30 сек, UI: "Сервер загружается..."
15. Очистка данных браузера → pending check-ins потеряны (sync как можно чаще когда online)
16. 30 мин непрерывного сканирования → проверить батарею (fps:10 оптимален)
