# FL Server — Карта кодовой базы + План рефакторинга

> 42 файла · ~8700 строк · Express + TypeScript + Supabase + MAIB

---

# ЧАСТЬ A: ПЛАН РЕФАКТОРИНГА

## Принципы

1. **Не ломать работающий код** — каждая фаза сохраняет поведение
2. **Инкрементально** — каждая фаза = отдельный коммит, можно задеплоить
3. **Verify after each step** — `npx tsc --noEmit` + проверка ключевых эндпоинтов
4. **Тесты после** — сначала чистим, потом покрываем тестами (тестировать грязный код = фиксировать грязную архитектуру)

---

## ФАЗА 1: Убить дублирование (Риск: низкий) — DONE

### 1.1 MAIB callback — два файла делают одно и то же — DONE
**Проблема:** `routes/webhook.ts:12-73` и `routes/maib.ts:18-79` — идентичный код обработки MAIB callback.

**Что сделано:**
- [x] Удалён `POST /api/webhook/maib` из `routes/webhook.ts` (остался только mock-payment)
- [x] Единственный MAIB callback = `POST /api/maib/callback` в `routes/maib.ts`
- [x] Убран `express.raw()` для `/api/webhook` в `index.ts` — больше не нужен
- [x] Проверено: `/api/webhook/maib` нигде не используется (MAIB настроен на `/api/maib/callback`)
- [x] mock-payment в webhook.ts — мёртвый код (фронтенд вызывает `/api/checkout/mock-process`)

### 1.2 ticket-cache — три метода загрузки одних данных — DONE
**Проблема:** `loadRegularTickets()` + `loadB2BTickets()` используются только в warmUp. `loadTicketsInto()` — более общий метод с retry logic. Код на 90% идентичен.

**Что сделано:**
- [x] Удалены `loadRegularTickets()` и `loadB2BTickets()` (-95 строк)
- [x] `warmUp()` использует `loadTicketsInto(tickets)` — единый путь загрузки + retry logic
- [x] Проверено на production: сканер работает, manifest загружается

### 1.3 B2B/regular order lookup duplication — DONE
**Проблема:** `routes/checkout.ts` — одинаковый код поиска B2B orders в двух endpoints.

**Что сделано:**
- [x] B2B fallback вынесен в `orderService.getOrderTickets()` — единое место
- [x] `GET /tickets/:orderNumber` и `GET /tickets/:orderNumber/download` упрощены (-70 строк)
- [x] Маппинг полей идентичен оригиналу (проверено побайтово)
- [x] Проверено на production: Flow 1 (покупка + скачивание) работает

---

## ФАЗА 2: Вынос бизнес-логики из routes в services (Риск: низкий) — DONE

### 2.1 admin.ts — invitations — DONE
**Что сделано:**
- [x] Создан `services/invitation.ts` с методами: createAndProcess, processBatch, sendUnsent
- [x] `routes/admin.ts`: 492 → 291 строк. Route теперь тонкий: validate → call service → respond
- [x] Проверено на production: создание приглашений + batch + send-unsent работает

### 2.2 mobile.ts — service layer — DONE
**Что сделано:**
- [x] Создан `services/mobile.ts` (560 строк) с 13 методами для всех mobile endpoints
- [x] `routes/mobile.ts`: 757 → 194 строк. Только parse params → call service → respond
- [x] Проверено на production: все разделы мобильного приложения работают

### 2.3 checkout.ts — download logic — SKIPPED (intentional)
**Решение:** Download endpoints содержат streaming logic (ZIP pipe в response, headers). Это **должно** быть в route layer. Вынос ради выноса = over-engineering. Уже упрощено в Фазе 1.3.

---

## ФАЗА 3: Модернизация maib-client (Риск: средний) — DONE

**Что сделано:**
- [x] Переписан `maib-client.ts` с raw `https` на `axios`: 441 → 273 строк (-168)
- [x] `axios.create({ timeout: 15000, headers })` — единый HTTP instance
- [x] `extractMaibError()` — вынесена общая логика парсинга ошибок MAIB
- [x] `verifyCallback()` — не изменён (crypto, не HTTP)
- [x] Побайтовая верификация: все endpoints, request bodies, response parsing, error formats, timeout — идентичны оригиналу
- [x] `tsc --noEmit` чисто
- [x] Проверено на production: оплата работает, callback приходит, заказ становится paid

---

## ФАЗА 4: Типизация (Риск: низкий) — DONE

### 4.1 Supabase join types — DONE
**Что сделано:**
- [x] Создан `types/supabase-joins.ts` с интерфейсами: `OrderItemRow`, `B2BOrderItemRow`, `ScannerRequest`
- [x] Убраны все `as any` из `ticket-cache.ts` (6 мест), `scan.ts` (6 мест), `auth.ts` (1 место)
- [x] Оставлен 1 `as any` в `index.ts` — pino-http typing issue, не наш код

### 4.2 Request validation — SKIPPED
**Решение:** admin.ts уже имеет ручную валидацию (проверка полей). Замена на zod — косметика, не критична.

---

## ФАЗА 5: Консистентность и чистка (Риск: низкий) — DONE

### 5.1 id-generator collision fix — DONE
- [x] `generateInvoiceNumber()`: `INV` → `FAC` (Factura). Теперь приглашения = `INV`, инвойсы = `FAC`

### 5.2 Legacy checkout callback — DONE
- [x] Удалён `GET /api/checkout/callback` (-43 строки) — не используется MAIB (настроен на `/api/maib/return/ok`)
- [x] Убран unused import `withRetry` из checkout.ts

### 5.3 Error handling consistency — SKIPPED
**Решение:** Потребует проверку ~30 catch блоков — риск не оправдывает пользу. Оставлено для следующей итерации.

### 5.4 Import cleanup — DONE (partial)
- [x] Убран unused `withRetry` из checkout.ts
- [x] Убраны unused `orderService`, `ticketService`, `pLimit` из admin.ts (Фаза 2.1)

---

## ФАЗА 6 (опционально): Структурные улучшения

### 6.1 Middleware для Zod validation
```typescript
// middleware/validate.ts
function validate(schema: ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) throw new AppError(...);
    req.validated = result.data;
    next();
  };
}
```

### 6.2 Response wrapper
```typescript
// Вместо: res.json({ success: true, data: {...} })
// Использовать: res.ok(data) или helper
function sendSuccess(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}
```

### 6.3 database.types.ts
- [ ] Сгенерировать реальные Supabase types: `npx supabase gen types typescript`
- [ ] Использовать `Database['public']['Tables']['orders']['Row']` вместо ручных интерфейсов

---

## ПОРЯДОК ВЫПОЛНЕНИЯ

```
Фаза 1 (дублирование)     → 1 коммит, ~30 мин     → tsc + smoke test
Фаза 2.2 (mobile service) → 1 коммит, ~1 час       → tsc + test /api/mobile/*
Фаза 2.1 (invitation svc) → 1 коммит, ~45 мин      → tsc + test admin invitations
Фаза 2.3 (download svc)   → 1 коммит, ~30 мин      → tsc + test downloads
Фаза 3 (maib-client)      → 1 коммит, ~1 час       → tsc + test payments (ОСТОРОЖНО)
Фаза 4 (типизация)        → 1 коммит, ~45 мин      → tsc --strict
Фаза 5 (чистка)           → 1 коммит, ~30 мин      → tsc + full review
Фаза 6 (опционально)      → по желанию
```

**Начинать с Фазы 1** — минимальный риск, максимальная чистота.

---

# ЧАСТЬ B: КАРТА КОДОВОЙ БАЗЫ

## 1. АРХИТЕКТУРА ВЕРХНЕГО УРОВНЯ

```
index.ts (точка входа)
  ├── config/        → env-переменные, валидация
  ├── middleware/     → auth (apiKey, scanner JWT), errorHandler
  ├── routes/        → HTTP-маршруты (9 модулей)
  ├── services/      → бизнес-логика (14 модулей)
  ├── templates/     → email HTML + переводы
  ├── types/         → TypeScript интерфейсы
  └── utils/         → id-генератор, crypto, retry, concurrency, logger
```

---

## 2. ФАЙЛЫ — НАЗНАЧЕНИЕ И РАЗМЕР

### Точка входа
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/index.ts` | 175 | Express app, middleware chain, rate limiters, route mounting, graceful shutdown, cron init, ticket cache warmup |

### Config
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/config/index.ts` | 90 | Все env-переменные: Supabase, MAIB, Resend, Scanner, Company info, Cron timing |

### Middleware
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/middleware/auth.ts` | 96 | `apiKeyAuth` (admin x-api-key), `scannerAuth` (HMAC-SHA256 JWT для сканеров), `timingSafeEqual` |
| `src/middleware/errorHandler.ts` | 46 | `AppError` class, centralized error handler с error ID и скрытием деталей в production |

### Routes (HTTP-маршруты)
| Файл | Строки | Эндпоинты | Назначение |
|-------|--------|-----------|------------|
| `src/routes/health.ts` | 13 | `GET /api/health` | Healthcheck |
| `src/routes/checkout.ts` | 456 | `POST /create-order`, `GET /callback`, `POST /mock-process`, `GET /status/:orderNumber`, `GET /tickets/:orderNumber`, `GET /tickets/:orderNumber/download`, `GET /tickets/:orderNumber/:ticketCode` | Весь checkout flow: создание заказа → оплата → скачивание билетов. Поддержка и regular, и B2B заказов для скачивания |
| `src/routes/promo.ts` | 55 | `POST /api/promo/validate` | Валидация промокодов |
| `src/routes/webhook.ts` | 109 | `POST /webhook/maib`, `POST /webhook/mock-payment` | MAIB callback webhook, mock callback для тестов |
| `src/routes/maib.ts` | 166 | `POST /callback`, `GET /return/ok`, `GET /return/fail` | MAIB прямые callback/redirect URL-ы (Ok URL, Fail URL, Callback URL) |
| `src/routes/admin.ts` | 492 | `POST /orders/:orderId/resend-tickets`, `POST /orders/:orderId/refund`, `POST /invitations` (single + batch), `POST /invitations/send-unsent`, `GET /invitations/job/:jobId` | Admin: переотправка билетов, рефанды, приглашения (single/batch/send-unsent), прогресс фоновых задач |
| `src/routes/b2b.ts` | 470 | `POST /calculate-discount`, `POST /create-order`, `GET /orders/:id`, `GET /orders`, `POST /orders/:id/generate-invoice`, `PATCH /orders/:id/mark-paid`, `POST /orders/:id/generate-tickets`, `POST /orders/:id/send-tickets`, `PATCH /orders/:id/cancel`, `GET /discount-tiers`, `GET /orders/:orderNumber/download-invoice`, `GET /orders/:orderNumber/download-tickets` | Весь B2B flow: расчёт скидок → заказ → инвойс → оплата → генерация билетов → отправка |
| `src/routes/mobile.ts` | 757 | `GET /tickets`, `/lineup`, `/news`, `/news/:slug`, `/gallery`, `/program`, `/partners`, `/activities`, `/aftermovies`, `/info`, `POST /devices/register`, `DELETE /devices/:token`, `GET /version` | API для мобильного приложения: весь контент фестиваля + push-регистрация + версия |
| `src/routes/scan.ts` | 208 | `POST /` (scan), `GET /stats`, `GET /cache/status`, `POST /cache/warmup`, `GET /device-stats`, `POST /live`, `GET /live/stream/:deviceId`, `POST /auth`, `GET /manifest`, `POST /batch` | Сканер билетов: scan, batch sync, auth, manifest, cache management, SSE live feed |

### Services (бизнес-логика)
| Файл | Строки | Экспортирует | Назначение |
|-------|--------|--------------|------------|
| `src/services/supabase.ts` | 25 | `supabase` | Singleton Supabase client (service role, 15s timeout) |
| `src/services/order.ts` | 552 | `orderService` | Создание заказов (regular + invitation), CRUD по заказам, markAsPaid/markAsFailed, processSuccessfulOrder (генерация PDF + email), reminders, cancel pending, expire old |
| `src/services/payment.ts` | 162 | `paymentService` | Обёртка над MAIB: createTransaction, checkStatus, reverse, verifyCallback, mock mode |
| `src/services/payment-callback.ts` | 105 | `findOrderByTransactionId`, `findOrderById`, `processPaymentResult` | Shared logic для обработки MAIB callback (ищет заказ в orders + b2b_orders, обрабатывает статус) |
| `src/services/maib-client.ts` | 441 | `maibClient` | Низкоуровневый HTTP-клиент MAIB REST API: token generation, createPayment, getPaymentInfo, refundPayment, verifyCallback signature. Использует raw `https` модуль (не axios!) |
| `src/services/email.ts` | 385 | `emailService` | Resend API: sendOrderConfirmation, send1stReminder, send2ndReminder, sendInvitationEmail, sendB2BInvoice, sendB2BTickets. Timeout 10s per email |
| `src/services/ticket.ts` | 115 | `ticketService` | Генерация QR-кодов, генерация PDF билетов (regular + invitation), загрузка в Supabase Storage |
| `src/services/ticket-pdfkit.ts` | 356 | `createTicketPDF`, `createInvitationPDF` | PDFKit: генерация PDF билетов с фоновой картинкой из Supabase, QR-кодом, данными билета. Кэш фона в памяти |
| `src/services/ticket-cache.ts` | 651 | `ticketCache` | In-memory кэш всех билетов для быстрого сканирования (~0.001ms lookup). WarmUp, periodic sync (60s), Supabase Realtime подписка, background flush check-ins (5s), graceful shutdown |
| `src/services/scan.ts` | 284 | `scanService` | Логика сканирования: scanTicket (fast path: cache, slow path: DB), batchCheckin, getCheckinStats |
| `src/services/live-feed.ts` | 84 | `liveFeed` | SSE broadcasting: push scan events → volunteer clients. In-memory last event + SSE client registry |
| `src/services/promo.ts` | 160 | `promoService` | Валидация промокодов: даты, лимиты, min_order_amount, allowed_ticket_ids, one_per_email. Atomic increment через Supabase RPC |
| `src/services/b2b-order.ts` | 650 | `b2bOrderService` | Весь B2B lifecycle: createOrder, markAsPaid, generateTickets (expand aggregated → individual + PDF), markTicketsAsSent, cancelOrder, history |
| `src/services/b2b-discount.ts` | 202 | `b2bDiscountService` | Тиры скидок (50+: 5%, 100+: 7%, 150+: 10%, 200+: 15%), расчёт, upsell (next tier) |
| `src/services/b2b-invoice.ts` | 442 | `invoiceService` | PDFKit генерация B2B инвойсов (A4, Roboto шрифт, таблица товаров, банковские реквизиты). Upload + email |
| `src/services/cron.ts` | 101 | `initCronJobs` | 3 cron задачи: 1st reminder (15min), 2nd reminder (1h), expire orders (30min). Защита от concurrent execution |
| `src/services/batch-job.ts` | 90 | `batchJobService` | In-memory трекер фоновых задач (invitations batch): status, progress, errors. Auto-cleanup через 1h |

### Templates
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/templates/email-components.ts` | 236 | HTML email компоненты: layout, header, heading, paragraph, ctaButton, infoRow/Table, noticeBox, ticketListSection, prohibitedSection, contactLine |
| `src/templates/translations.ts` | 225 | Переводы ro/ru: order confirmation, invitation, reminders (1st/2nd), B2B invoice, B2B tickets |

### Types
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/types/index.ts` | 157 | Order, OrderItem, OrderItemWithJoins, B2BOrderItemWithJoins, PromoCode, Ticket, TicketOption, CreateOrderRequest, CreateInvitationRequest, ValidatePromoRequest, MAIB types |
| `src/types/database.types.ts` | 3 | Placeholder для Supabase generated types |

### Utils
| Файл | Строки | Назначение |
|-------|--------|------------|
| `src/utils/logger.ts` | 9 | Pino logger (pretty в dev, json в production) |
| `src/utils/id-generator.ts` | 41 | nanoid: generateOrderNumber (`FL2603-XXXXXX`), generateInvitationNumber, generateB2BOrderNumber, generateInvoiceNumber, generateTicketCode, generateB2BTicketCode |
| `src/utils/ticket-crypto.ts` | 81 | HMAC-SHA256: signTicketCode, verifyTicketSignature, createSignedQRData, parseQRData, signDownloadUrl, verifyDownloadSignature, buildTicketDownloadUrl |
| `src/utils/retry.ts` | 28 | `withRetry` — exponential backoff (2s base, max 3) |
| `src/utils/concurrency.ts` | 20 | `pLimit` — ограничение параллелизма async операций |

---

## 3. ГРАФ ЗАВИСИМОСТЕЙ (кто кого импортирует)

### Ядро (используется ВСЕМИ)
```
config/index.ts      ← почти всё
services/supabase.ts ← все services + некоторые routes
utils/logger.ts      ← все modules
middleware/errorHandler.ts (AppError) ← routes + services
```

### Routes → Services
```
routes/checkout.ts    → orderService, b2bOrderService, paymentService, supabase, retry, ticket-crypto
routes/admin.ts       → orderService, emailService, ticketService, batchJobService, supabase, concurrency
routes/b2b.ts         → b2bOrderService, b2bDiscountService, invoiceService, paymentService, supabase
routes/webhook.ts     → paymentService, payment-callback
routes/maib.ts        → orderService, b2bOrderService, paymentService, payment-callback
routes/mobile.ts      → supabase (прямые запросы, без service layer!)
routes/scan.ts        → scanService, ticketCache, auth, live-feed
routes/promo.ts       → promoService
```

### Services → Services (internal)
```
order.ts             → supabase, ticketService, emailService, promoService, id-generator, ticket-crypto
payment.ts           → maib-client, config
payment-callback.ts  → orderService, b2bOrderService, supabase
email.ts             → Resend, templates, ticket-crypto (download URLs)
ticket.ts            → supabase, ticket-pdfkit, concurrency, QRCode
ticket-pdfkit.ts     → supabase (background image)
ticket-cache.ts      → supabase (load + realtime + flush)
scan.ts              → supabase, ticketCache, ticket-crypto
live-feed.ts         → (standalone, no deps)
promo.ts             → supabase
b2b-order.ts         → supabase, b2bDiscountService, ticketService, ticket-pdfkit, emailService, id-generator, ticket-crypto, concurrency
b2b-discount.ts      → (standalone, no deps)
b2b-invoice.ts       → supabase, b2bOrderService, emailService, config, PDFKit
cron.ts              → orderService, emailService, concurrency
batch-job.ts         → (standalone, in-memory store)
```

---

## 4. ПОТОКИ ДАННЫХ (DATA FLOWS)

### Flow 1: Покупка билета (B2C)
```
Frontend → POST /api/checkout/create-order
  → orderService.createOrder() [DB: orders + order_items]
  → paymentService.createTransaction() [MAIB API]
  → orderService.updateTransactionId()
  → redirect → MAIB payment page

MAIB → POST /api/maib/callback (webhook)
  → paymentService.verifyCallback()
  → findOrderByTransactionId()
  → processPaymentResult()
    → orderService.markAsPaid()
    → orderService.processSuccessfulOrder()
      → ticketService.generateTickets() [QR + PDF + Supabase Storage]
      → emailService.sendOrderConfirmation() [Resend]

MAIB → GET /api/maib/return/ok (redirect)
  → redirect → Frontend /checkout/success
```

### Flow 2: B2B заказ
```
Frontend → POST /api/b2b/create-order
  → b2bOrderService.createOrder() [discount calc + DB]
  → if online: paymentService.createTransaction() → MAIB
  → if invoice: invoiceService.generateInvoice() [PDF + email]

After payment:
  → b2bOrderService.markAsPaid()
  → b2bOrderService.generateTickets()
    → expand aggregated items → individual tickets
    → generate QR + PDF for each
    → b2bOrderService.markTicketsAsSent()
    → emailService.sendB2BTickets()
```

### Flow 3: Сканирование на входе
```
Scanner PWA → POST /api/scan/auth [PIN → JWT token]
Scanner PWA → GET /api/scan/manifest [все билеты для offline]

Scanner (online) → POST /api/scan
  → scanService.scanTicket()
    → parseQRData() + verifySignature()
    → ticketCache.get() (fast: ~0.001ms)
    → ticketCache.checkIn() (memory + background DB write)

Scanner (offline) → POST /api/scan/batch
  → scanService.batchCheckin() [sync offline check-ins]

Scanner → POST /api/scan/live [push to volunteer]
Volunteer → GET /api/scan/live/stream/:deviceId [SSE]
```

### Flow 4: Приглашения (Admin)
```
Admin → POST /api/admin/invitations
  → orderService.createInvitation() [DB: order + items, $0]
  → batchJobService.create()
  → respond immediately
  → background: generate PDFs → emailService.sendInvitationEmail()

Admin → POST /api/admin/invitations/batch [CSV import]
  → N × orderService.createInvitation()

Admin → POST /api/admin/invitations/send-unsent
  → find unsent → background generate PDFs + send emails
```

### Flow 5: Cron Jobs
```
Every 15min: sendFirstReminders (orders pending > 1h, reminder_count=0)
Every 1h:    sendSecondReminders (orders pending > 24h, reminder_count=1)
Every 30min: expireOldPendingOrders (orders pending > 72h → expired)
```

---

## 5. ВНЕШНИЕ ЗАВИСИМОСТИ

| Сервис | Клиент | Используется в |
|--------|--------|----------------|
| **Supabase** (PostgreSQL + Storage + Realtime) | `@supabase/supabase-js` | Везде — основная БД |
| **MAIB** (Payment Gateway) | raw `https` module | `maib-client.ts` → `payment.ts` |
| **Resend** (Email) | `resend` SDK | `email.ts` |
| **QR Code** | `qrcode` | `ticket.ts` |
| **PDFKit** | `pdfkit` | `ticket-pdfkit.ts`, `b2b-invoice.ts` |
| **Archiver** | `archiver` | `checkout.ts`, `b2b.ts` (ZIP downloads) |

---

## 6. ТАБЛИЦЫ БД (Supabase PostgreSQL)

Определено из использования в коде:
- `orders` — B2C заказы
- `order_items` — позиции B2C заказов (1 строка = 1 билет)
- `b2b_orders` — B2B заказы
- `b2b_order_items` — позиции B2B заказов
- `b2b_order_history` — история статусов B2B
- `tickets` — каталог типов билетов
- `ticket_options` — опции билетов
- `promo_codes` — промокоды
- `artists` — лайнап артистов
- `news` — новости (ro/ru)
- `gallery` — фото галерея
- `program` — расписание фестиваля
- `partners` — партнёры (по тирам)
- `activities` — активности
- `aftermovies` — видео
- `site_contacts` — контакты (key-value)
- `contacts` — контакты отделов
- `faq` — FAQ (ro/ru)
- `device_tokens` — push notification tokens

Supabase Storage buckets:
- `tickets` — PDF билетов + инвойсов
- `PDF` — фон для PDF билетов (`ticket-bg.jpg`), логотип email (`email.png`)

RPC функции:
- `increment_promo_usage(p_code)` — атомарный инкремент использования промокода

---

## 7. ПРОБЛЕМНЫЕ ЗОНЫ (для рефакторинга)

### 7.1 Дублирование кода
- **MAIB callback логика**: `routes/webhook.ts:12-73` и `routes/maib.ts:18-79` — **ИДЕНТИЧНЫЙ код**. Оба обрабатывают MAIB callback с verify signature → find order → process result. Один из них лишний.
- **B2B ticket/invoice download**: `routes/checkout.ts:239-345` и `routes/b2b.ts` содержат дублированную логику поиска заказов в обоих таблицах (orders + b2b_orders).
- **ticket-cache.ts**: `loadRegularTickets()` + `loadB2BTickets()` (строки 250-344) vs `loadTicketsInto()` (строки 459-541) — три метода загрузки одних и тех же данных с почти идентичным кодом.

### 7.2 Толстые роуты (бизнес-логика в routes)
- **`routes/admin.ts:156-264`** — создание приглашения + фоновая генерация PDF + отправка email — 108 строк бизнес-логики прямо в route handler.
- **`routes/admin.ts:344-449`** — send-unsent invitations — ещё 105 строк бизнес-логики в route.
- **`routes/checkout.ts:127-210`** — mock-process содержит сложную логику поиска в обоих таблицах + разную обработку.
- **`routes/checkout.ts:239-453`** — download endpoints с inline Supabase Storage logic.
- **`routes/mobile.ts`** — **ВСЕ 757 строк** — это прямые запросы к Supabase без service layer. Каждый эндпоинт содержит select + transform inline.

### 7.3 `any` типы и слабая типизация
- `ticket-cache.ts`: повсеместные `(item.order as any)`, `(item.ticket as any)?.name_ro`
- `b2b-order.ts`: `(aggregatedItem.ticket?.name_ro || 'Ticket')` через `any`
- `admin.ts`: `req.body as CreateInvitationRequest` без zod валидации
- `routes/checkout.ts:266-271`: `as unknown as Array<{...}>` — Supabase join type workaround

### 7.4 Архитектурные проблемы
- **`routes/mobile.ts`** не имеет service layer — все запросы к DB прямо в route handlers. При рефакторинге нужен `mobileService` или разбиение на отдельные сервисы.
- **`maib-client.ts`** использует raw `https` вместо `axios` (который уже в dependencies!). 441 строка boilerplate можно сократить до ~100.
- **`payment-callback.ts`** — хороший пример вынесения shared logic, но `findOrderById` не используется в webhook.ts (только в maib.ts).
- **`batch-job.ts`** — in-memory store теряет данные при restart. Для production нужен persistent store (но это может быть intentional для MVP).

### 7.5 Inconsistencies
- `generateInvoiceNumber()` и `generateInvitationNumber()` в `id-generator.ts` генерируют одинаковый формат `INV${year}${month}-${nanoid(6)}` — collision risk между инвойсами и приглашениями.
- Rate limiter `skip` для scan: `req.path.startsWith('/api/scan')` в apiLimiter, но отдельный `scanLimiter` тоже применяется.
- `checkout.ts` callback (`GET /callback`) — legacy MAIB flow, дублирует `maib.ts` return/ok. Возможно, мёртвый код.

### 7.6 Потенциальные проблемы
- **No transaction safety**: `order.ts:createOrder` — insert order → insert items → increment promo. Если items fail, order rollback есть, но если promo increment fail после items — inconsistency.
- **`ticket-cache.ts` periodic sync** перезаписывает весь кэш каждые 60 секунд (`tickets.clear() → repopulate`) — кратковременное окно ~1-5ms где кэш пуст. Atomic swap через tempMap решает это, но `loadTicketsInto` может быть медленным при большом числе билетов.
- **B2B generateTickets** — DELETE aggregated items → INSERT individual. Если INSERT fails, aggregated data lost.

---

## 8. SECURITY

- Admin routes: `apiKeyAuth` middleware (x-api-key header)
- Scanner routes: `scannerAuth` middleware (HMAC-SHA256 signed JWT, 48h TTL)
- Ticket QR: HMAC-SHA256 signed (`CODE.SIGNATURE` format)
- Download URLs: separate HMAC namespace (`dl:order:code`)
- MAIB callbacks: signature verification (SHA256)
- Rate limiting: per-route with different limits
- CORS: whitelist frontend + scanner URLs
- Helmet: security headers (CSP disabled — API only)
- Constant-time comparison everywhere (`timingSafeEqual`)

---

## 9. RUNTIME СОСТОЯНИЕ (in-memory)

| Что | Где | Lifecycle |
|-----|-----|-----------|
| Ticket cache (Map) | `ticket-cache.ts` | Warm up at start → periodic sync 60s → realtime updates → flush check-ins 5s |
| Mock transactions (Map) | `payment.ts` | Only in mock mode, ephemeral |
| Live feed events (Map) | `live-feed.ts` | Last event per device, SSE client registry |
| SSE clients (Map) | `live-feed.ts` | Cleaned on disconnect |
| Batch jobs (Map) | `batch-job.ts` | Auto-cleanup after 1h, max 100 |
| Running cron jobs (Set) | `cron.ts` | Prevents concurrent execution |
| BG image cache (Buffer) | `ticket-pdfkit.ts` | Loaded once, cached forever |
