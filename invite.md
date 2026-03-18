# Bulk CSV Invitation Import — Enterprise Plan

## Context
~2000 пригласительных перед фестивалем. Текущая страница: limit(50), нет пагинации/поиска, форма на той же странице. Нужно production-ready решение.

## Архитектурные решения

### 1. Server-side pagination (не client-side)
**Почему:** 2000+ записей с вложенными items+tickets — нельзя загружать всё в браузер.
**Как:** Supabase `.range(from, to)` + `.select('*', { count: 'exact' })`. TanStack Table с `manualPagination: true`, `manualFiltering: true`. Каждая смена страницы/фильтра = новый запрос к БД.

### 2. Двухфазный импорт
**Фаза 1 — Создание записей в БД (синхронно, ~20 сек)**
- CSV парсится на фронте (PapaParse)
- Preview + валидация перед импортом
- Backend: `createInvitation()` × N с `pLimit(10)`
- Результат: записи в БД, видны в таблице сразу

**Фаза 2 — Генерация PDF + отправка email (фоново, ~60 сек)**
- Кнопка "Отправить все неотправленные"
- Backend: фоновая задача, `pLimit(5)`
- Frontend: polling прогресса
- Resilient: повторный клик подхватит неотправленные (WHERE pdf_url IS NULL)

### 3. Отдельные страницы вместо модалок
- `/admin/invitations` — список
- `/admin/invitations/create` — форма
- `/admin/invitations/import` — CSV импорт

### 4. Никаких новых колонок в БД
- Неотправленные = `order_items.pdf_url IS NULL AND orders.is_invitation = true`
- Не нужен batch_id — "отправить все неотправленные" universal

## Страницы

| URL | Назначение |
|-----|-----------|
| `/admin/invitations` | Список: server-side таблица, пагинация, поиск, фильтры, stats |
| `/admin/invitations/create` | Создание одного приглашения (существующая форма + кнопка назад) |
| `/admin/invitations/import` | CSV: upload → preview → валидация → импорт с прогрессом |

## UI списка
```
Приглашения          [Всего: 2045] [Отправлено: 1998] [Не отправлено: 47]

[+ Создать]  [📄 Импорт CSV]  [📨 Отправить все (47)]    🔍 Поиск...  📅 Дата

| Номер   | Получатель      | Билеты | Заметка  | Статус    | Дата   | ⋮ |
|---------|-----------------|--------|----------|-----------|--------|---|
| INV-001 | Иван Иванов     | 2      | VIP      | ✅ Отпр.  | 18.03  |   |
| INV-002 | Анна Петрова    | 1      | Партнёр  | ⏳ Ожид.  | 18.03  |   |
                           < 1 2 3 ... 103 >
```

## Файлы

### Frontend (Next.js)
| # | Действие | Файл | Описание |
|---|----------|------|----------|
| 1 | REWRITE | `invitations/page.tsx` | Server component: stats, кнопки, InvitationsTable (server-side pagination) |
| 2 | REWRITE | `invitations/InvitationsTable.tsx` | Client component: TanStack Table с manualPagination, поиск, фильтры, server fetch |
| 3 | NEW | `invitations/create/page.tsx` | Обёртка: кнопка назад + существующий CreateInvitationForm |
| 4 | NEW | `invitations/import/page.tsx` | CSV: PapaParse, preview таблица, валидация, POST batch, прогресс |
| 5 | NEW | `invitations/BatchSendButton.tsx` | Кнопка отправки + polling прогресса + progress bar |
| 6 | EDIT | `invitations/CreateInvitationForm.tsx` | Только: добавить Input для quantity (уже сделали) |
| 7 | NEW | `api/admin/invitations/batch/route.ts` | Proxy: POST batch create |
| 8 | NEW | `api/admin/invitations/send-unsent/route.ts` | Proxy: POST start + GET status |

### Backend (Express)
| # | Действие | Файл | Описание |
|---|----------|------|----------|
| 9 | EDIT | `routes/admin.ts` | +3 endpoints: batch create, send-unsent, job status |
| 10 | NEW | `services/batch-job.ts` | In-memory job tracker (Map + auto-cleanup 1h) |

### Dependencies
- `papaparse` + `@types/papaparse` (frontend, для CSV parsing)

## CSV формат
```csv
firstName,lastName,email,phone,ticketType,quantity,language,note
Иван,Иванов,ivan@mail.com,+37360123456,Day Pass,2,ru,VIP гость
Мария,Петрова,maria@corp.md,,Weekend Pass,1,ro,Партнёр
```
- `ticketType` — имя билета (name_ro или name_ru), маппится на ticket ID
- `phone`, `note` — опциональные
- `language` — `ro` или `ru`, default `ro`
- `quantity` — сколько билетов этого типа для этого человека

## Backend endpoints

### POST /api/admin/invitations/batch
```json
// Request
{ "invitations": [{ "firstName", "lastName", "email", "phone?", "ticketId", "optionId?", "quantity", "language", "note?" }] }

// Response (синхронно, ~20 сек)
{ "created": 1987, "failed": 13, "errors": [{ "row": 5, "error": "Invalid email" }] }
```
Внутри: `pLimit(10)` → `orderService.createInvitation()` для каждой строки. Try/catch per row.

### POST /api/admin/invitations/send-unsent
```json
// Response (мгновенно)
{ "jobId": "uuid", "total": 47 }
```
Запускает фоновую задачу. Находит: `orders.is_invitation = true` JOIN `order_items WHERE pdf_url IS NULL`.
Для каждого order: generateInvitationTickets → update pdf_url → sendInvitationEmail.

### GET /api/admin/invitations/send-unsent/:jobId
```json
// Response
{ "status": "processing", "total": 47, "processed": 23, "sent": 22, "failed": 1, "errors": [...] }
```

## Server-side pagination (InvitationsTable)

```typescript
// Supabase query pattern
const { data, count } = await supabase
  .from('orders')
  .select('*, items:order_items(id, ticket_code, pdf_url, ticket:tickets(name_ro, name_ru))', { count: 'exact' })
  .eq('is_invitation', true)
  .ilike('customer_name', `%${search}%`)  // или .or() для поиска по нескольким полям
  .order('created_at', { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

TanStack Table config:
```typescript
const table = useReactTable({
  data,
  columns,
  manualPagination: true,
  manualFiltering: true,
  pageCount: Math.ceil(totalCount / pageSize),
  state: { pagination, globalFilter },
  onPaginationChange: setPagination,
  onGlobalFilterChange: setGlobalFilter,
});
```

## Обработка ошибок
- **CSV parse error** → подсветка в preview, строка помечена как невалидная
- **Unknown ticketType** → ошибка в preview (фронт знает все имена билетов)
- **Duplicate email** → допускается (приглашения разрешают дубли)
- **DB insert fail** → try/catch per row, частичный успех возможен
- **PDF generation fail** → ошибка в job, order остаётся в БД, retry через "отправить все"
- **Email fail** → аналогично, retry через повторный клик
- **Server restart** → job state теряется, но "отправить все" ищет по pdf_url IS NULL — resilient

## Порядок реализации
1. **Server-side InvitationsTable** с пагинацией/поиском
2. **Перенос формы** на `/admin/invitations/create`
3. **Backend batch endpoint** + proxy route
4. **CSV import page** с PapaParse + preview
5. **Backend send-unsent** + job tracker
6. **BatchSendButton** с polling

## Тестирование
1. Таблица: пагинация работает, поиск фильтрует на сервере, 20 записей на страницу
2. Создание: `/admin/invitations/create` → создать → redirect к списку
3. Импорт: CSV 5 строк → preview корректный → import → записи в таблице
4. Импорт: CSV с ошибками → невалидные строки подсвечены → пропущены при импорте
5. Отправка: кнопка → прогресс → email приходят → статус в таблице обновился
6. Retry: намеренно прервать отправку → повторный клик → продолжает с неотправленных
