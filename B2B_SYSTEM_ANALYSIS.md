# Анализ текущей системы билетов Festivalul Lupilor

> **Дата анализа:** 7 декабря 2024
> **Цель:** Полное понимание текущей системы билетов перед разработкой B2B функционала

---

## 📋 Оглавление

1. [Архитектура системы](#1-архитектура-системы)
2. [База данных](#2-база-данных)
3. [Процесс покупки билетов](#3-процесс-покупки-билетов)
4. [Платежная система](#4-платежная-система)
5. [Генерация и отправка билетов](#5-генерация-и-отправка-билетов)
6. [Админ панель](#6-админ-панель)
7. [API Endpoints](#7-api-endpoints)
8. [Email система](#8-email-система)
9. [Выводы для B2B](#9-выводы-для-b2b)

---

## 1. Архитектура системы

### 1.1 Технологический стек

**Frontend:**
- Next.js 16.0.6 (App Router + Turbopack)
- React 19 (latest)
- TypeScript
- Tailwind CSS + Shadcn UI
- i18n (румынский, русский)
- React Context API (для корзины)

**Backend:**
- Node.js + Express.js
- TypeScript
- Supabase (PostgreSQL + Storage + Auth)
- Resend (Email сервис)
- PDFKit (генерация PDF)
- QRCode (генерация QR-кодов)

**Платежная система:**
- MAIB (Moldova Agroindbank) - основная платежная система Молдовы
- Mock режим для тестирования

**Инфраструктура:**
- Supabase Storage (облачное хранилище билетов)
- Cron jobs (напоминания и автоматизация)

### 1.2 Структура проекта

```
fl-site/
├── src/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── tickets/          # Страница выбора билетов
│   │   │   ├── checkout/         # Процесс оформления
│   │   │   ├── b2b/              # B2B страница (NEW)
│   │   ├── admin/                # Админ панель
│   │   ├── api/                  # Next.js API routes
│   ├── components/
│   ├── context/CartContext.tsx   # Управление корзиной
│   ├── lib/api.ts                # API клиент
│
├── server/                       # Backend (Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── checkout.ts       # API оформления заказов
│   │   │   ├── webhook.ts        # Callbacks от MAIB
│   │   │   ├── admin.ts          # Admin API
│   │   ├── services/
│   │   │   ├── order.ts          # Бизнес-логика заказов
│   │   │   ├── payment.ts        # Интеграция MAIB
│   │   │   ├── ticket.ts         # Генерация билетов
│   │   │   ├── ticket-pdfkit.ts  # PDF генератор
│   │   │   ├── email.ts          # Email сервис
│   │   │   ├── promo.ts          # Промокоды
│   │   │   ├── cron.ts           # Автоматизация
│
├── supabase/
│   ├── migrations/               # SQL миграции
│
├── messages/                     # i18n переводы
│   ├── ro.json
│   ├── ru.json
```

---

## 2. База данных

### 2.1 Основные таблицы

#### `tickets` - Типы билетов
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  features_ro TEXT[] DEFAULT '{}',
  features_ru TEXT[] DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  currency TEXT DEFAULT 'MDL',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  max_per_order INTEGER DEFAULT 10,
  has_options BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Примеры билетов:**
- Day Pass - 380 MDL
- Weekend Pass - 600 MDL
- Camping Pass - 750 MDL (с опциями)
- Family Passes - 900-1900 MDL

---

#### `ticket_options` - Опции билетов
```sql
CREATE TABLE ticket_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ro TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_ro TEXT,
  description_ru TEXT,
  price_modifier NUMERIC(10,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Примеры опций (для Camping Pass):**
- Tent Spot - 0 MDL (по умолчанию)
- Parking Spot - 0 MDL
- Camper/RV Spot - 0 MDL

---

#### `orders` - Заказы
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,           -- FL2512-XXXXXX
  status TEXT CHECK (status IN (
    'pending', 'paid', 'failed', 'refunded', 'expired', 'cancelled'
  )),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  promo_code TEXT,
  maib_transaction_id TEXT,
  payment_status TEXT CHECK (payment_status IN (
    'pending', 'ok', 'failed', 'reversed'
  )),
  failure_reason TEXT,
  paid_at TIMESTAMP,
  reminder_sent_at TIMESTAMP,
  reminder_count INTEGER DEFAULT 0,
  language TEXT DEFAULT 'ro' CHECK (language IN ('ro', 'ru')),
  client_ip TEXT,
  is_invitation BOOLEAN DEFAULT false,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  refunded_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Индексы:**
- `idx_orders_status` (быстрый поиск по статусу)
- `idx_orders_customer_email` (поиск заказов клиента)
- `idx_orders_maib_transaction_id` (связь с платежом)
- `idx_orders_created_at` (сортировка)
- `idx_orders_is_invitation` (фильтрация приглашений)

---

#### `order_items` - Билеты в заказе
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  ticket_option_id UUID REFERENCES ticket_options(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  ticket_code TEXT UNIQUE NOT NULL,              -- 12-символьный код
  qr_data TEXT NOT NULL,                         -- JSON {code, ts, inv?}
  pdf_url TEXT,                                  -- Ссылка на Supabase Storage
  status TEXT DEFAULT 'valid' CHECK (status IN (
    'valid', 'used', 'refunded'
  )),
  scanned_at TIMESTAMP,
  is_invitation BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Индексы:**
- `idx_order_items_order_id` (связь с заказом)
- `idx_order_items_ticket_code` (быстрый поиск по коду)
- `idx_order_items_status` (фильтрация)
- `idx_order_items_is_invitation` (приглашения)

**Важно:** Один билет = одна запись, даже если quantity > 1 в корзине

---

#### `promo_codes` - Промокоды
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2) CHECK (discount_percent BETWEEN 0 AND 100),
  discount_amount NUMERIC(10,2) CHECK (discount_amount >= 0),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  min_order_amount NUMERIC(10,2),
  allowed_ticket_ids UUID[],                     -- Ограничение по билетам
  one_per_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Примеры:**
- `WOLF10` - 10% скидка (лимит 100)
- `FESTIVAL20` - 20% скидка (лимит 50)
- `VIP50` - 50% скидка (лимит 10)

---

#### `email_logs` - История отправки email
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  email_type TEXT CHECK (email_type IN (
    'confirmation', 'reminder', 'refund'
  )),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN (
    'sent', 'failed', 'bounced'
  )),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.2 TypeScript интерфейсы

```typescript
// Билет
interface TicketData {
  id: string;
  name: string;
  nameRo: string;
  nameRu: string;
  descriptionRo?: string;
  descriptionRu?: string;
  featuresRo?: string[];
  featuresRu?: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  maxPerOrder?: number;
  hasOptions?: boolean;
  options?: TicketOption[];
}

// Опция билета
interface TicketOption {
  id: string;
  name: string;
  nameRo: string;
  nameRu: string;
  descriptionRo?: string;
  descriptionRu?: string;
  priceModifier?: number;
  isDefault?: boolean;
}

// Элемент корзины
interface CartItem {
  ticket: TicketData;
  quantity: number;
  selectedOption?: TicketOption;
}
```

---

### 2.3 Связи между таблицами

```
tickets (1) ──┬─→ (M) ticket_options
              └─→ (M) order_items

orders (1) ────→ (M) order_items
           └───→ (M) email_logs

order_items ──┬─→ (1) tickets
              ├─→ (1) ticket_options
              └─→ (1) orders (CASCADE DELETE)

promo_codes ──→ orders.promo_code (TEXT)
```

---

## 3. Процесс покупки билетов

### 3.1 Поток пользователя

```
1. ВЫБОР БИЛЕТОВ (/tickets)
   ↓
   - Пользователь выбирает тип и количество
   - Если Camping Pass → выбор опции (палатка/парковка/кемпер)
   - Добавление в корзину (CartContext)
   - Сохранение в localStorage (ключ: "fl-cart")

2. ПЕРЕХОД К CHECKOUT (/checkout)
   ↓
   - Загрузка корзины из localStorage
   - Если пусто → redirect на /tickets
   - Отображение формы + summary

3. ВВОД ДАННЫХ
   ↓
   - firstName, lastName (обязательно)
   - email (валидация regex)
   - phone (валидация через react-phone-number-input)
   - hearAbout (опционально)
   - comment (опционально)
   - acceptTerms (обязательно)
   - acceptMarketing (опционально)

4. ПРИМЕНЕНИЕ ПРОМОКОДА (опционально)
   ↓
   - Ввод кода (маска UPPERCASE)
   - POST /api/promo/validate
   - Проверка валидности
   - Расчёт скидки
   - Отображение в summary

5. СОЗДАНИЕ ЗАКАЗА
   ↓
   - Валидация всех полей
   - POST /api/checkout/create-order
   - Backend создаёт заказ (status: pending)
   - Генерация ticket_code для каждого билета
   - Генерация QR-данных

6. ПЛАТЁЖ
   ↓
   - Backend создаёт MAIB транзакцию
   - Redirect на MAIB Gateway (или mock-payment)
   - Пользователь оплачивает
   - MAIB отправляет callback на /api/webhook/maib

7. ОБРАБОТКА РЕЗУЛЬТАТА
   ↓
   A. УСПЕХ (OK):
      - Статус: paid
      - Генерация PDF билетов (async)
      - Отправка email с билетами
      - Redirect → /checkout/success

   B. ОШИБКА (FAILED):
      - Статус: failed
      - Сохранение причины
      - Redirect → /checkout/failed

   C. ОЖИДАНИЕ (PENDING):
      - Остаётся pending
      - Через 1 час → напоминание #1
      - Через 24 часа → напоминание #2
      - Через 72 часа → статус expired

8. СТРАНИЦА УСПЕХА (/checkout/success)
   ↓
   - Отображение номера заказа
   - Polling каждые 2 сек (проверка готовности PDF)
   - Кнопка "Скачать билеты" (активна когда PDF готовы)
   - GET /api/checkout/tickets/{orderNumber}/download
```

### 3.2 Создание заказа (Backend)

**Endpoint:** `POST /api/checkout/create-order`

**Request:**
```typescript
{
  customer: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  },
  items: [
    {
      ticketId: string,
      optionId?: string,
      quantity: number
    }
  ],
  promoCode?: string,
  language: 'ro' | 'ru'
}
```

**Процесс:**
1. Отмена старых pending заказов для этого email
2. Расчёт цены:
   - Базовая цена билета
   - + Модификатор опции (если есть)
   - × Количество
3. Применение промокода (если есть)
4. Создание заказа:
   - Генерация order_number: `FL${YYMM}-${nanoid(6)}`
   - status: `pending`
   - payment_status: `pending`
5. Создание order_items:
   - Для каждого билета генерируется ticket_code (12 символов)
   - QR данные: `{code, ts: Date.now()}`
6. Инкремент used_count промокода
7. Создание MAIB транзакции
8. Возврат `{orderId, orderNumber, redirectUrl}`

---

## 4. Платежная система

### 4.1 Интеграция MAIB

**MAIB** - Moldova Agroindbank, основная платежная система Молдовы

**Режимы работы:**
- **Production** - реальные платежи через MAIB Gateway
- **Mock** - тестовые платежи (для разработки)

**Файл:** `/Users/aleksandrkorcevoj/fl-site/server/src/services/payment.ts`

### 4.2 Создание транзакции

```typescript
interface CreateTransactionParams {
  orderId: string;
  amount: number;
  description: string;
  clientIp: string;
  language: 'ro' | 'ru';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// Mock режим
if (config.maib.mockMode) {
  const mockTransactionId = `MOCK_${nanoid(20)}`;
  return {
    transactionId: mockTransactionId,
    payUrl: `/checkout/mock-payment?trans_id=${mockTransactionId}`
  };
}

// Production режим
const payment = await maibClient.createPayment({
  amount: params.amount,
  currency: 'MDL',
  clientIp: params.clientIp,
  orderId: params.orderId,
  description: params.description,
  okUrl: `${frontendUrl}/checkout/success?order=${params.orderId}`,
  failUrl: `${frontendUrl}/checkout/failed?order=${params.orderId}`,
  callbackUrl: `${backendUrl}/api/webhook/maib`
});

return {
  transactionId: payment.payId,
  payUrl: payment.payUrl
};
```

### 4.3 Callback обработка

**Endpoint:** `POST /api/webhook/maib`

**Процесс:**
1. Верификация подписи MAIB
2. Поиск заказа по transactionId
3. Обработка результата:
   - `OK/COMPLETED/SUCCESS/APPROVED` → markAsPaid()
   - `FAILED/DECLINED/ERROR` → markAsFailed()
   - `PENDING` → оставить pending
4. Асинхронная генерация билетов (для успешных)

---

## 5. Генерация и отправка билетов

### 5.1 Генерация PDF

**Библиотека:** PDFKit (быстрее чем @react-pdf)

**Файл:** `/Users/aleksandrkorcevoj/fl-site/server/src/services/ticket-pdfkit.ts`

**Размеры билета:**
- Ширина: 320 пт (~11 см)
- Высота: 560 пт (~20 см)

**Элементы билета:**
1. Фоновое изображение (`/server/src/assets/ticket-bg.jpg`)
2. Белая секция с rounded corners
3. Название фестиваля: "FESTIVALUL LUPILOR" (14pt, жирный)
4. Дата: "7-9 August 2026" (10pt, серый)
5. **QR-код**: 120x120 пт
6. **Уникальный код**: 12 символов (Courier)
7. Разделитель (линия)
8. **Тип билета**: название (16pt, жирный)
9. **Опция**: если есть (11pt)
10. **Имя покупателя**: (10pt)
11. **Номер заказа**: #FL2512-XXXXXX

**Два типа билетов:**
- `createTicketPDF` - обычный билет
- `createInvitationPDF` - приглашение (золотой значок "INVITATION")

### 5.2 QR-коды

**Библиотека:** `qrcode`

**Параметры:**
```typescript
{
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  },
  errorCorrectionLevel: 'L'
}
```

**Содержимое QR:**
```json
{
  "code": "TICKET_CODE_12",
  "ts": 1733520000,
  "inv": true  // только для приглашений
}
```

**Формат:** Base64 data URL (PNG), встраивается в PDF

### 5.3 Хранение билетов

**Хранилище:** Supabase Storage

**Структура:**
```
tickets/
  FL2512-XXXXXX/
    ├── TICKET_CODE_1.pdf
    ├── TICKET_CODE_2.pdf
    └── ...
```

**Процесс:**
1. PDF генерируется в памяти (Buffer)
2. Загружается в Supabase Storage
3. Получается публичный URL
4. URL сохраняется в `order_items.pdf_url`

**Параллельная обработка:** Все билеты заказа генерируются параллельно (`Promise.all()`)

### 5.4 Email отправка

**Сервис:** Resend API

**Файл:** `/Users/aleksandrkorcevoj/fl-site/server/src/services/email.ts`

**Типы писем:**

#### 1. Подтверждение заказа (`sendOrderConfirmation`)
- Приветствие с именем
- Номер заказа #FL2512-XXXXXX
- Резюме заказа (сумма, скидка)
- Таблица билетов с кодами
- Кнопки скачивания PDF:
  - 1-2 билета → отдельные кнопки
  - 3+ билетов → одна кнопка "Скачать все" (ZIP)
- Предупреждение (жёлтое): "Сохрани билеты..."
- Запрещённые действия (иконки)
- Секция приложения (App Store, Google Play)

#### 2. Приглашение (`sendInvitationEmail`)
- Золотой градиент
- Значок "INVITATION"
- Без информации о цене

#### 3. Первое напоминание (1 час)
- Оранжевый заголовок
- "Забыли оплатить?"
- Мягкий тон
- Сумма заказа

#### 4. Второе напоминание (24 часа)
- Красный заголовок
- "Билеты ещё ждут!"
- Срочный тон

**Языки:** RO и RU (переводы в самом файле)

---

## 6. Админ панель

### 6.1 Структура

**Путь:** `/src/app/admin`

**Аутентификация:** Supabase Auth (обязательна)

**Основные разделы:**
- **Dashboard** - обзор
- **Аналитика** - графики продаж
- **Заказы** - управление заказами
- **Билеты** - типы билетов
- **Приглашения** - бесплатные билеты
- **Промо-коды** - скидки
- Lineup, Программа, Активности
- Новости, Партнёры
- Настройки

### 6.2 Управление заказами

**Список заказов** (`/admin/orders`)

**Фильтрация:**
- По статусу (pending, paid, failed, expired, cancelled, refunded)
- По типу (обычные / приглашения)
- По периоду (7д, 30д, 3м, 1г, всё время, кастом)
- Поиск (номер, email, имя, телефон)

**Сортировка:**
- По номеру, сумме, дате

**Функции:**
- Экспорт в CSV
- Пагинация (20 на странице)

**Статистика:**
- Всего заказов
- Оплачено
- Ожидает оплаты
- Отменено/ошибки
- Общая выручка
- Приглашений

**Детали заказа** (`/admin/orders/[id]`)

**Информация:**
- Номер, статус, дата
- Сумма, скидка, итого
- Кол-во билетов
- Статус оплаты
- Язык клиента

**Данные клиента:**
- ФИО, email, телефон
- История заказов
- Общая сумма покупок

**Данные платежа:**
- Статус, дата оплаты
- Причина отказа
- MAIB Transaction ID
- IP клиента
- Напоминания (до 2)

**Список билетов:**
- Код каждого билета
- Статус (valid/used/refunded)
- Дата скана
- Цена

### 6.3 Операции над заказами

#### Изменение email
**API:** `PATCH /api/admin/orders/[id]/update-email`
- Валидация email
- Обновление в БД

#### Возврат средств
**API:** `POST /api/admin/orders/[id]/refund`
- Только для paid заказов
- Требует причину возврата
- **Необратимо!**
- Отслеживание: refund_reason, refunded_at, refunded_by

#### Повторная отправка билетов
**API:** `POST /api/admin/orders/[id]/resend-tickets`
- Только для paid заказов
- Отправка email с PDF
- Отслеживание: reminder_count, reminder_sent_at

#### Скачивание билетов
- Открывает GET /api/checkout/tickets/{orderNumber}/download
- 1 билет → PDF
- 2+ билетов → ZIP

### 6.4 Аналитика

**Метрики:**
- Всего заказов (оплачено)
- Выручка (MDL)
- Билетов продано
- Средний чек

**График продаж:**
- Периоды: 7д, 30д, 3м, 1г, всё время
- Режимы: выручка, заказы, билеты
- Типы: график площади, столбцы
- Агрегация: дни/недели/месяцы

**Популярные билеты:**
- Топ 10
- По количеству или выручке
- Горизонтальная диаграмма или пирог
- Таблица с деталями

---

## 7. API Endpoints

### 7.1 Frontend API (Next.js)

```
POST   /api/admin/orders/[id]/update-email
POST   /api/admin/orders/[id]/resend-tickets
POST   /api/admin/orders/[id]/refund
```

### 7.2 Backend API (Express)

**Checkout:**
```
POST   /api/checkout/create-order
GET    /api/checkout/callback?trans_id=XXX
POST   /api/checkout/mock-process
GET    /api/checkout/status/:orderNumber
GET    /api/checkout/tickets/:orderNumber
GET    /api/checkout/tickets/:orderNumber/download
```

**Promo:**
```
POST   /api/promo/validate
```

**Webhook:**
```
POST   /api/webhook/maib
```

**Admin:**
```
POST   /api/admin/orders/:orderId/resend-tickets
POST   /api/admin/orders/:orderId/refund
POST   /api/admin/invitations
```

---

## 8. Email система

### 8.1 Сервис: Resend

**Конфигурация:**
```typescript
const resend = new Resend(config.email.resendApiKey);
from: config.email.from // support@festivalullupilor.md
```

### 8.2 Шаблоны

**Все шаблоны:**
- HTML с inline CSS
- Responsive дизайн
- Многоязычность (RO/RU)
- Брендинг фестиваля

**Структура письма:**
- Градиентный заголовок
- Приветствие с именем
- Основной контент
- CTA кнопки
- Footer с контактами

### 8.3 Автоматизация

**Cron jobs:**
- Каждые 15 минут: первое напоминание (1 час)
- Каждый час: второе напоминание (24 часа)
- Каждый час: истечение заказов (72 часа)

**Конфиг:**
```typescript
cron: {
  enabled: process.env.ENABLE_CRON_JOBS === 'true',
  firstReminderHours: 1,
  secondReminderHours: 24,
  pendingExpireHours: 72
}
```

---

## 9. Выводы для B2B

### 9.1 Что можем переиспользовать

✅ **База данных:**
- Таблицы `tickets`, `ticket_options` - как есть
- Таблица `orders` - расширить для B2B
- Таблица `order_items` - использовать
- Таблица `email_logs` - использовать

✅ **Генерация билетов:**
- PDFKit генератор - готов
- QR-коды - готовы
- Supabase Storage - готов
- Email сервис - готов

✅ **Платёжная система:**
- MAIB интеграция - готова
- Callback обработка - готова
- Mock режим - готов для тестирования

✅ **Admin функционал:**
- Фильтрация/поиск - готов
- Экспорт CSV - готов
- Аналитика - частично готов

### 9.2 Что нужно добавить

❌ **Новые таблицы:**
```sql
-- B2B заказы
b2b_orders:
  - id
  - order_number
  - company_name
  - company_tax_id
  - contact_name, contact_email, contact_phone
  - payment_method (enum: 'online', 'invoice')
  - status (pending, invoice_sent, paid, tickets_sent, completed, cancelled)
  - total_amount, discount_percent, discount_amount, final_amount
  - invoice_url
  - notes
  - created_at, updated_at

-- Позиции B2B заказа
b2b_order_items:
  - id
  - order_id (FK -> b2b_orders)
  - ticket_id (FK -> tickets)
  - quantity
  - unit_price
  - discount_percent
  - total_price

-- История B2B заказов
b2b_order_history:
  - id
  - order_id
  - status
  - changed_by (admin user_id)
  - note
  - created_at
```

❌ **Новый функционал:**
- Калькулятор пакета на фронте
- Прогрессивная система скидок (10-20%)
- Форма B2B заказа
- Генерация счетов (PDF)
- Массовая генерация билетов
- Admin панель B2B:
  - Список B2B заказов
  - Детали заказа
  - Генерация счетов
  - Отправка билетов
  - Управление статусами

❌ **Новые API:**
```
POST   /api/b2b/calculate-discount
POST   /api/b2b/create-order
POST   /api/b2b/orders/:id/generate-invoice
POST   /api/b2b/orders/:id/generate-tickets
POST   /api/b2b/orders/:id/send-tickets
PATCH  /api/b2b/orders/:id/mark-paid
```

❌ **Новые email шаблоны:**
- Подтверждение B2B заказа
- Счёт на оплату (PDF приложение)
- Напоминание об оплате
- Уведомление о готовности билетов
- Отправка билетов (ZIP архив)

### 9.3 Ключевые отличия B2B

| Аспект | B2C (текущая) | B2B (планируемая) |
|--------|--------------|------------------|
| **Минимум билетов** | 1 | 50 |
| **Скидка** | 0-50% (промокод) | 10-20% (прогрессивная) |
| **Оплата** | Только онлайн | Онлайн или по счёту |
| **Генерация билетов** | Сразу после оплаты | Вручную или авто |
| **Персонализация** | Имя покупателя | Имя компании + список сотрудников |
| **Email** | 1 адрес | Несколько адресов |
| **Статусы** | 6 статусов | 6+ статусов (invoice_sent, tickets_sent) |
| **Счета** | Нет | PDF счёт |
| **Админ панель** | Базовая | Расширенная (генерация, отправка) |

### 9.4 Рекомендации по архитектуре

✅ **Переиспользовать:**
- Все сервисы генерации (ticket.ts, ticket-pdfkit.ts)
- Email сервис (расширить шаблонами)
- Платёжный сервис (MAIB)
- Хранилище (Supabase Storage)

✅ **Создать новые:**
- `b2b-order.ts` - сервис B2B заказов
- `invoice.ts` - генерация счетов
- `b2b-discount.ts` - логика скидок
- `b2b-email.ts` - B2B шаблоны

✅ **Архитектурные решения:**
- **Отдельные таблицы** (b2b_orders vs orders) - легче управлять
- **Общие сервисы** (генерация PDF, email) - DRY принцип
- **Раздельная админка** (/admin/b2b-orders vs /admin/orders) - разный UX
- **API versioning** (/api/v1/b2b/) - для будущего масштабирования

---

## 10. Следующие шаги

### Этап 1: База данных (Неделя 1)
- [ ] Создать миграции для B2B таблиц
- [ ] Добавить RLS политики
- [ ] Создать индексы
- [ ] Добавить тестовые данные

### Этап 2: Backend API (Неделя 2)
- [ ] Сервис b2b-order.ts
- [ ] Сервис invoice.ts (генерация счетов)
- [ ] Сервис b2b-discount.ts
- [ ] API endpoints
- [ ] Тесты

### Этап 3: Frontend (Неделя 3-4)
- [ ] Калькулятор пакета
- [ ] Форма B2B заказа
- [ ] Страница успеха
- [ ] Email шаблоны

### Этап 4: Admin панель (Неделя 5)
- [ ] Список B2B заказов
- [ ] Детали заказа
- [ ] Операции (генерация, отправка)
- [ ] Аналитика

### Этап 5: Тестирование (Неделя 6)
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] E2E тесты
- [ ] Load тесты

---

**Документ готов к использованию для разработки B2B функционала! 🚀**
