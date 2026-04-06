# План исправления уязвимостей в авторизации

**Дата аудита:** 2026-04-06
**Автор:** security review
**Статус:** черновик, требует аппрува перед исполнением

---

## TL;DR

В проекте найдены **3 критических** и несколько менее серьёзных дыр в авторизации. Основная проблема: в системе нет понятия «администратор» — ни в коде, ни в БД. Мобильное приложение и админ-панель делят одну и ту же `auth.users` в Supabase, а RLS-политики массово выдают права всему `authenticated` (то есть любому мобильному юзеру) или даже `anon`. Любой человек, зарегистрировавшийся в приложении из Google Play, сейчас может:

1. Зайти в веб-админку с теми же кредами и получить полный доступ к админ-панели.
2. Напрямую через публичный Supabase REST API прочитать все заказы (email, имена, телефоны, суммы) и модифицировать/удалять их.
3. Поменять промокоды, B2B-заказы, контакты сайта, новости, программу, правила фестиваля.
4. Сломать пуши для всего фестиваля.

Все правки локальны (миграция + несколько TS-файлов). Мобильное приложение пересобирать и перезаливать в Google Play **не нужно** — контракт с клиентом не меняется.

---

## Что именно проверено

### Серверная часть
- `server/src/middleware/auth.ts` — `apiKeyAuth` (admin API) и `scannerAuth` (HMAC-SHA256 токены для сканеров).
- `server/src/routes/mobile.ts` — все публичные и защищённые мобильные роуты.
- `server/src/services/supabase.ts` — инициализация клиента с service role.

### Next.js
- `src/lib/supabase/{client,server,middleware,admin}.ts` — все способы создания supabase-клиента.
- `src/app/admin/login/page.tsx` — форма входа в админку.
- `src/app/admin/(dashboard)/layout.tsx` — гейтинг админ-страниц.
- `src/app/api/admin/**/route.ts` — все admin API-роуты (orders/refund, scan-cache, notifications, invitations, gallery, b2b, scan-devices, etc.).

### БД / RLS
- Все 23 миграции в `supabase/migrations/`.

---

## CRITICAL #1 — Любой мобильный пользователь = администратор

### Доказательства

1. `src/app/admin/login/page.tsx:25` — вход в админку это голый `supabase.auth.signInWithPassword({ email, password })`. Никакого allowlist'а, никакой проверки роли.
2. `src/lib/supabase/middleware.ts:32-55` — защита `/admin/*` роутов проверяет только «пользователь залогинен?» через `supabase.auth.getUser()`.
3. `src/app/admin/(dashboard)/layout.tsx:13-19` — та же проверка, только `getUser()` без ролей.
4. `src/app/api/admin/**/route.ts` — все admin API-роуты (я прогрепал, их около 15) проверяют **только** `user !== null`. Пример: `src/app/api/admin/orders/[id]/refund/route.ts:25-31`.
5. `server/src/routes/mobile.ts:192,243` — мобильный бэкенд использует `supabase.auth.getUser(token)`, то есть мобильные юзеры лежат в той же `auth.users`, что и админы.
6. Грепы по `is_admin`, `admin_users`, `role.*admin`, `ADMIN_EMAIL`, `allowedAdmins` — ни одного попадания.

### Эксплойт

1. Юзер регистрируется в мобильном приложении (OTP на email).
2. Открывает в браузере `festivalul-lupilor.md/admin/login`.
3. Вводит свой email и пароль от приложения.
4. Получает полный доступ: видит все заказы, делает рефанды, рассылает push, правит промокоды.

### Фикс

**Шаг 1. Определить источник истины для роли админа.**
Рекомендуемый вариант — `app_metadata.role = 'admin'` в Supabase Auth. Это поле редактируется **только** через service role, сам пользователь его подделать не может (в отличие от `user_metadata`).

Альтернатива — таблица `public.admin_users (user_id uuid primary key references auth.users(id))`. Чуть больше кода, но проще аудитить и восстанавливать.

Выбираем `app_metadata.role` — проще и идиоматичнее для Supabase.

**Шаг 2. Промаркировать существующих админов.**
Через Supabase dashboard (SQL Editor) или management API:
```sql
-- Выполнять через service_role, подставить реальные email'ы админов
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email IN ('admin1@example.com', 'admin2@example.com');
```
Заранее согласовать с владельцем проекта точный список email'ов.

**Шаг 3. Создать helper `requireAdmin()`.**
Новый файл `src/lib/auth/require-admin.ts`:
```ts
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const isAdmin = user.app_metadata?.role === "admin";
  return { user, isAdmin };
}
```

**Шаг 4. Применить `requireAdmin` везде.**

1. `src/lib/supabase/middleware.ts` — после получения `user` добавить проверку `user.app_metadata?.role === 'admin'` для всех `/admin/*` кроме `/admin/login`. Если не админ — редирект на `/admin/login` + `signOut()`.
2. `src/app/admin/(dashboard)/layout.tsx` — использовать `requireAdmin()`, редиректить не-админов.
3. `src/app/admin/login/page.tsx` — после успешного `signInWithPassword` проверять роль; если не админ — `signOut()` и показать ошибку «нет доступа».
4. **Все** файлы `src/app/api/admin/**/route.ts`:
   - `notifications/route.ts` (GET, POST)
   - `scan-cache/route.ts` (GET, POST)
   - `scan-devices/route.ts`
   - `invitations/route.ts`
   - `invitations/batch/route.ts`
   - `invitations/job/[jobId]/route.ts`
   - `invitations/send-unsent/route.ts`
   - `invitations/send-unsent/[jobId]/route.ts`
   - `gallery/upload/route.ts`
   - `gallery/delete/route.ts`
   - `orders/create/route.ts`
   - `orders/[id]/update-email/route.ts`
   - `orders/[id]/resend-tickets/route.ts`
   - `orders/[id]/refund/route.ts`
   - `b2b/orders/[id]/[action]/route.ts`
   В каждом заменить `const { data: { user } } = await supabase.auth.getUser(); if (!user) return 401;` на `const { user, isAdmin } = await requireAdmin(); if (!isAdmin) return 401;`.

**Шаг 5. Проверка.** Тестовым юзером (не в allowlist'е) попробовать:
- `/admin/login` → должен пустить на форму, но после ввода кредов — отказ.
- Прямой запрос в `/api/admin/orders/...` с cookie тестового юзера → 401.
- Реальный админ → всё работает как раньше.

---

## CRITICAL #2 — RLS раздаёт всю БД любому `authenticated`

### Доказательства

**Таблицы с политикой `USING (auth.role() = 'authenticated')` для SELECT/INSERT/UPDATE/DELETE:**

| Таблица | Файл | Что видно / что можно менять |
|---|---|---|
| `orders` | `20241205_create_orders_tables.sql:84-90` | email, имена, телефоны, суммы, transaction_id всех покупателей |
| `order_items` | `20241205_create_orders_tables.sql:97-99` | тикеты, коды билетов, статусы |
| `promo_codes` | `20241205_create_orders_tables.sql:106-108` | UPDATE discount=100%, usage_limit, чтение всех кодов |
| `email_logs` | `20241205_create_orders_tables.sql:111-113` | PII из логов писем |
| `b2b_orders` | `20251207_create_b2b_tables.sql:81-88` | корпоративные заказы |
| `b2b_order_items` | `20251207_create_b2b_tables.sql:98-105` | |
| `b2b_order_history` | `20251207_create_b2b_tables.sql:115-122` | |
| `tickets` | `create_tickets_table.sql:48` | `FOR ALL USING (auth.role() = 'authenticated')` — каталог билетов |
| `ticket_options` | `create_tickets_table.sql:49` | то же |
| `site_settings` | `create_site_settings_table.sql:17` | `FOR ALL USING (auth.role() = 'authenticated')` |
| `activities` | `20251210_create_activities_table.sql:34-53` | `TO authenticated` для INSERT/UPDATE/DELETE |
| `festival_rules` | `20251211_create_festival_rules_table.sql:33-52` | то же |
| `partnership_requests` | `20251210_create_partnership_requests.sql:34-41` | то же |
| `faq` | `20251210_fix_faq_rls_policies.sql:33-38` | `TO authenticated` `USING (true)` |

### Эксплойт

Мобильный юзер залогинен → у него есть access token с `role=authenticated` → он открывает:
```
GET https://<project>.supabase.co/rest/v1/orders?select=*
Authorization: Bearer <его_token>
apikey: <публичный anon key из мобилки>
```
И получает **все заказы фестиваля**. То же самое через `PATCH` / `DELETE` / `POST`.

Это GDPR-инцидент. Email, телефоны, имена покупателей — персональные данные.

### Фикс

Создать новую миграцию `supabase/migrations/<дата>_tighten_rls_policies.sql`, которая:

1. Дропает все политики вида `USING (auth.role() = 'authenticated')` и `TO authenticated USING (true)` на перечисленных выше таблицах.
2. Оставляет/создаёт только политики `TO service_role USING (true) WITH CHECK (true)`.
3. Где нужен публичный read (каталог билетов, активные промокоды для валидации, активные FAQ) — оставляет `FOR SELECT` отдельной политикой с явным условием (`is_active = true`).
4. Для `promo_codes`: SELECT публичный (нужен для валидации кода в checkout), но **только** `is_active=true` и **без** чтения `usage_count`, `discount_percent`, `valid_until` напрямую клиентом. Правильнее — валидировать промокод **только** через бэкенд, а RLS поставить `service_role only`. Это требует правки клиента checkout'а — проверить, где он читает `promo_codes` напрямую.

**Перед применением:** прогнать в staging-проекте Supabase, убедиться, что:
- Next.js админка работает (она ходит через service role).
- Мобильный бэкенд работает (ходит через service role).
- Мобильное приложение не падает на эндпоинтах, которые ходят в БД напрямую с `anon` ключом (это отдельный риск — если мобилка читает `orders` с anon-ключом, то RLS должен всё равно это разрешить; но скорее всего мобилка ходит только через `/api/mobile/*`).
- Checkout (публичная часть сайта) с anon ключом всё ещё может валидировать промокоды (если валидация была прямо из браузера).

**Откат:** старый файл миграции не трогаем, новый можно откатить отдельной DOWN-миграцией.

---

## CRITICAL #3 — Таблицы с `USING (true)` без роли (доступ анонимным)

### Доказательства

| Таблица | Файл | Политика |
|---|---|---|
| `device_tokens` | `20251208_create_mobile_tables.sql:28-29` | `FOR ALL USING (true) WITH CHECK (true)` — название лжёт |
| `push_notifications_log` | `20251208_create_mobile_tables.sql:123-124` | `FOR ALL USING (true)` |
| `contacts` | `20241210_add_contacts_write_policies.sql:4-11` | INSERT/UPDATE/DELETE `USING (true)` |
| `site_contacts` | `20241210_add_contacts_write_policies.sql:14-21` | то же |
| `news` | `20251209_fix_mobile_api_tables.sql:69-70` | `FOR ALL USING (true) WITH CHECK (true)` |
| `program` | `20251209_fix_mobile_api_tables.sql:114-115` | то же |

### Последствия

Это ещё хуже #2 — здесь доступ даже не требует логина. **Любой человек** с anon-ключом (который лежит в клиентском бандле сайта и мобилки, т.е. публичный):
- Удаляет все `device_tokens` → пуши для фестиваля мертвы.
- Подменяет телефоны/email в `contacts` и `site_contacts` → фишинг.
- Публикует фейковые новости и пункты программы.
- Читает историю push-рассылок.

### Фикс

В той же миграции из #2 или в отдельной:
- Все перечисленные политики дропнуть.
- Заменить на `TO service_role USING (true) WITH CHECK (true)`.
- Где нужен публичный read — отдельный `FOR SELECT` с конкретным условием:
  - `news`: `FOR SELECT USING (is_published = true)` — уже есть.
  - `program`: `FOR SELECT USING (is_active = true)` — уже есть.
  - `contacts` / `site_contacts`: `FOR SELECT USING (true)` — уже есть.
  - `device_tokens`, `push_notifications_log`: никакого публичного read не нужно, всё через бэкенд.

---

## HIGH #4 — FAQ admin policy с мёртвой логикой

`20251208_create_mobile_tables.sql:60-67`:
```sql
CREATE POLICY "Admins can manage FAQ" ON faq FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.role = 'admin')
);
```
`auth.users.role` в Supabase — это Postgres-роль, всегда `'authenticated'` или `'anon'`. Значения `'admin'` там быть не может → политика не даёт доступ никому. В `20251210_fix_faq_rls_policies.sql` её потом заменили, но на ещё более дырявую `TO authenticated USING (true)` (см. #2).

**Фикс:** в той же миграции tightening — заменить на `TO service_role`.

**Урок (зафиксировать в проекте):** никогда не писать RLS, опираясь на `auth.users.role`. Источник правды для бизнес-ролей — `app_metadata` или отдельная таблица `admin_users`.

---

## HIGH #5 — Админ-логин без rate limiting, капчи и MFA

**Что сейчас:**
- `src/app/admin/login/page.tsx` — голый password auth, без Turnstile/hCaptcha.
- Нет 2FA.
- Нет ограничения попыток на стороне клиента.

**Фикс:**
1. **Сегодня:** в Supabase dashboard → Authentication → Rate Limits → понизить `token` / `signin` лимит до разумного (например, 5 попыток в минуту с одного IP).
2. **Сегодня:** Authentication → Policies → Minimum password length ≥ 12.
3. **На этой неделе:** включить Turnstile (бесплатный у Cloudflare) и добавить капчу в форму логина — Supabase поддерживает из коробки, это 2 конфиг-строки.
4. **В ближайшую итерацию:** включить MFA (TOTP) для админов. Supabase `auth.mfa.enroll()` + `challenge()` + `verify()`. Отдельная страница `/admin/mfa`.

---

## MEDIUM #6 — `NEXT_PUBLIC_API_URL` с дефолтом `localhost:3001`

Во всех `src/app/api/admin/*/route.ts`:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

**Проблемы:**
- Fallback на `localhost:3001` — если переменная не задана в проде, сервер стучится в локалхост и может попасть в чужой процесс на том же порту.
- Префикс `NEXT_PUBLIC_` означает, что URL попадает в клиентский бандл. Не секрет, но ненужная утечка архитектуры.

**Фикс:**
1. Переименовать `NEXT_PUBLIC_API_URL` → `API_URL` (server-only).
2. Убрать fallback, бросать ошибку при старте если переменная не задана: в `src/lib/config.ts` (создать) сделать строгую проверку через `zod`.
3. Обновить все роуты, чтобы читать из централизованного конфига.

---

## MEDIUM #7 — Единый `ADMIN_API_KEY` без ротации

`server/src/middleware/auth.ts:11-32` — один секрет на все админ-роуты бэкенда. Если утёк — компрометация полная, ротация ручная (надо одновременно обновить в env Next.js и Express сервера).

**Фикс (без аврала):**
1. Ротировать `ADMIN_API_KEY` **после** применения фиксов #1-#3 (на случай, если старый уже утёк через какой-нибудь лог).
2. Хранить в secret manager (Vercel/Railway/что используется).
3. Убедиться, что access-логи не пишут заголовок `x-api-key`: в `server/src/index.ts` проверить morgan/pino конфиг, добавить в список игнорируемых заголовков.

---

## MEDIUM #8 — Авторизация мобильных заказов по email

`server/src/routes/mobile.ts:200-205, 249` — `/orders` и `/ticket-pdf` проверяют принадлежность заказа юзеру через `customer_email === user.email`.

**Проблемы:**
- `customer_email` не всегда нормализован в lowercase при записи (проверить checkout). Сейчас `.toLowerCase()` применяется только на стороне выборки. Если при создании заказа email сохранили как `User@Example.com`, а юзер зарегистрирован как `user@example.com` — заказ не найдётся.
- Юзер может сменить свой email через `supabase.auth.updateUser({email})`. После этого он «захватит» все заказы с новым email (если такие есть в БД). Может быть желаемое поведение, а может и нет.

**Фикс (на ближайшую итерацию, не критично):**
1. Нормализовать email в `lower()` при записи во всех местах создания orders: checkout, админ-ручное создание, b2b.
2. Добавить в `orders` колонку `user_id uuid references auth.users(id)` и заполнять её при покупке, если юзер залогинен. Делать matching по `user_id`, а не по email.
3. Email оставить как fallback только для гостевых заказов (когда покупали без логина).

---

## LOW / замечания (не критично, но стоит зафиксировать)

1. **`scannerAuth` query-token в логах** (`server/src/middleware/auth.ts:47`). Для SSE токен прилетает в query-string, попадает в access-логи прокси. Убедиться, что TTL сканерных токенов короткий (минуты, не часы). Рассмотреть передачу через `EventSource` polyfill с заголовками, если возможно.

2. **`scannerAuth` отсутствие лимита размера payload** (`auth.ts:74`). `Buffer.from(payload, 'base64url').toString()` + `JSON.parse` без верхней границы размера. DoS маловероятен (токен обычно короткий), но стоит проверить длину `payload` перед парсингом (например, < 4KB).

3. **`timingSafeEqual` ручная реализация** (`auth.ts:90-97`). Работает корректно, но идиоматичнее использовать `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` с предварительной проверкой длин.

4. **`updateSession` глотает ошибки** (`src/lib/supabase/middleware.ts:36`). Если Supabase недоступен — юзер молча становится анонимным и редиректится на login. Логгировать хотя бы warn, чтобы такие инциденты были видны.

5. **`src/app/admin/login/page.tsx:31`** — сообщение «Неверный email или пароль» — хорошо (не раскрывает, существует ли юзер). Ok.

6. **`server/src/services/supabase.ts`** — `autoRefreshToken:false`, `persistSession:false`, таймаут 15с — всё правильно.

---

## Порядок исполнения

### Фаза 1 — критично, делать сегодня (≈ 3-4 часа)

Цель: закрыть #1, #2, #3, #4. После неё мобильные юзеры не смогут эскалироваться в админа и не смогут ходить в БД напрямую.

1. **БД — tightening миграция (#2, #3, #4).** Подготовить `supabase/migrations/<timestamp>_tighten_rls_policies.sql`. Прогнать в staging, проверить что админка/мобилка работают. Применить в prod.
2. **Код — `requireAdmin` (#1).** Создать helper, обновить middleware, layout, login page, все admin API routes. Проверить unit/smoke-тестом.
3. **Проставить `app_metadata.role='admin'`** реальным админам в prod через SQL Editor.
4. **Smoke test в prod:**
   - Реальный админ заходит → всё работает.
   - Тестовый не-админ регистрируется через мобилку → в веб-админку не пускает.
   - `curl https://<project>.supabase.co/rest/v1/orders` с не-админским токеном → `[]` или 401/403.

### Фаза 2 — в течение 24-48 часов (≈ 2 часа)

5. **Rate limiting и капча (#5).** Supabase dashboard + Turnstile на форме.
6. **Ротация `ADMIN_API_KEY` (#7).** Обновить env в обоих сервисах.
7. **Убрать fallback `localhost:3001` и переименовать переменную (#6).**
8. **Минимальная длина пароля ≥ 12** в Supabase policies.

### Фаза 3 — ближайший спринт

9. **MFA для админов (#5).**
10. **Normalization email + `user_id` в orders (#8).**
11. **Логи и мелкие замечания (#LOW).**

---

## Контрольный чек-лист для Фазы 1

- [ ] Создан helper `src/lib/auth/require-admin.ts`
- [ ] `src/lib/supabase/middleware.ts` — проверяет `app_metadata.role === 'admin'`
- [ ] `src/app/admin/(dashboard)/layout.tsx` — использует `requireAdmin`
- [ ] `src/app/admin/login/page.tsx` — после логина проверяет роль, при отказе делает `signOut()`
- [ ] Обновлены все admin API routes (~15 файлов) — используют `requireAdmin`
- [ ] Миграция `<timestamp>_tighten_rls_policies.sql` написана
- [ ] Миграция прогнана в staging
- [ ] Проверено: админка работает в staging
- [ ] Проверено: мобильный бэкенд работает в staging
- [ ] Проверено: checkout работает в staging (промокоды валидируются)
- [ ] Миграция применена в prod
- [ ] Реальным админам проставлен `app_metadata.role='admin'` в prod
- [ ] Smoke test в prod пройден (реальный админ ок, фейковый не-админ отбит)
- [ ] Проверено: прямой запрос к Supabase REST API с не-админским токеном возвращает `[]`/401 на `orders`, `promo_codes`, `b2b_orders`, `device_tokens`, `contacts`

---

## Что НЕ нужно делать

- **Не** пересобирать и не перезаливать мобильное приложение в Google Play. Контракт между клиентом и бэкендом не меняется. Все фиксы серверные.
- **Не** менять на стороне мобилки логику логина/токенов/чтения заказов. Мобильный бэкенд `/api/mobile/*` уже правильно гейтит заказы по email юзера — эту часть мы только *улучшаем* (#8), но это не блокер.
- **Не** отключать RLS глобально «чтобы работало». Наоборот — RLS должна быть последней линией обороны. Правильная политика — `service_role only` + доступ через бэкенд.
- **Не** хранить роль админа в `user_metadata` — юзер сам её отредактирует. Только `app_metadata` или отдельная таблица.

---

## Открытые вопросы к владельцу проекта (нужны ответы перед Фазой 1)

1. **Список email'ов реальных админов** — кого помечать `app_metadata.role='admin'`?
2. **Staging-проект Supabase существует?** Если нет — миграцию применяем сразу в prod на свой страх и риск, или создаём staging перед фиксом.
3. **Читает ли публичный checkout `promo_codes` напрямую с anon-ключом** (без похода в свой бэкенд)? Если да — нужно либо оставить публичный SELECT с аккуратным условием, либо переписать валидацию на серверную ручку.
4. **Были ли подозрительные запросы в логах Supabase** за последние месяцы (SELECT на `orders` от `authenticated` роли)? Если были — это значит утечка PII уже произошла и нужно оценить необходимость уведомления пользователей по GDPR Art. 33/34.
5. **Где хранится `ADMIN_API_KEY`** и кто имел к нему доступ? Нужно для оценки риска его компрометации.
