# Фаза 2 — чек-лист развёртывания

Код Фазы 2 готов. Осталось выполнить несколько действий, которые **не** автоматизируются из кодовой базы: настройки в Supabase Dashboard, Cloudflare Turnstile и Vercel env vars.

Идти строго сверху вниз.

---

## 1. Supabase: rate limiting, password policy, captcha config

### 1.1 Минимальная длина пароля ≥ 12

Dashboard → **Authentication → Sign In / Providers** (или **Policies** в новой версии UI) → секция **Password Security**:

- **Password minimum length** → `12`
- Если есть опция «Require uppercase/lowercase/number/special» — включить что-то хотя бы одно (например, требовать цифру). Не переусердствуй: слишком строгие требования ухудшают UX без значимого прироста безопасности, 12+ символов уже достаточно.

Save.

### 1.2 Rate limiting на `/auth/v1/token` (brute force защита)

Dashboard → **Authentication → Rate Limits**.

Рекомендуемые значения (не базовые, базовые слишком либеральны):

- **Rate limit for sign in / sign up (token endpoint)** → `10` per hour per IP (вместо дефолтных 30).
- **Rate limit for token refreshes** → можно оставить дефолт.
- **Rate limit for email/SMS sends** → оставить дефолт либо понизить если часто шлёте письма.

Логика значений: реальный админ логинится в среднем несколько раз в день. 10 попыток в час на IP — это и в 5 раз больше нормы. Брутфорс умрёт даже при 10 попытках.

### 1.3 Включить Turnstile captcha в Supabase Auth

Пока пропусти этот подпункт. Сначала нужно создать Turnstile-виджет на Cloudflare (раздел 2 ниже), получить `site key` и `secret key`, только потом возвращаться сюда.

После получения ключей:

Dashboard → **Authentication → Attack Protection → Captcha** (или **Bot and Abuse Protection** — название зависит от версии):

- **Enable Captcha** → on
- **Captcha provider** → `Turnstile`
- **Captcha secret key** → вставить `secret key` из Cloudflare (это тот, что начинается на `0x4AAA...`)
- Save

С этого момента **все вызовы `signInWithPassword` будут требовать валидный `captchaToken`**. Если его не передать — Supabase отдаст `AuthApiError: captcha verification process failed`. Мой код уже передаёт токен, так что это ок для админского логина.

**⚠️ Важно:** если на сайте где-то ещё используется `signInWithPassword` / `signUp` / `signInWithOtp` (в мобилке или в других местах сайта), они тоже начнут требовать captcha. Проверил по коду — в этом репозитории только `/admin/login` использует `signInWithPassword`, других мест нет. Мобильное приложение использует OTP-регистрацию через Supabase Auth — проверь, включает ли ты captcha для OTP тоже. Если включишь **только для email/password** (Dashboard даёт выбор по типу флоу), мобилка точно не пострадает.

---

## 2. Cloudflare Turnstile: создать виджет

Turnstile — это бесплатный капча-сервис Cloudflare. Не требует подтверждения у пользователя в большинстве случаев (invisible challenge).

1. Зайти на https://dash.cloudflare.com → залогиниться (можно создать бесплатный аккаунт).
2. Слева в меню **Turnstile** → **Add Site**.
3. Заполнить:
   - **Widget name:** `fl-site admin login`
   - **Hostnames:** твой прод-домен (например `festivalullupilor.md`). Можно добавить несколько строк: и прод, и preview Vercel (`*.vercel.app`), и `localhost` для разработки.
   - **Widget Mode:** `Managed` (Cloudflare сам решает, показывать challenge или нет)
   - **Pre-clearance for this site:** off (не нужно)
4. Create.
5. Скопировать **две** выданные строки:
   - **Site Key** (публичный, начинается на `0x4AAA...`) — это пойдёт в env `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
   - **Secret Key** (приватный, тоже `0x4AAA...`) — это пойдёт в Supabase Dashboard (раздел 1.3 выше).

Не путай site key и secret key. Если перепутаешь — капча просто не заработает.

---

## 3. Vercel: обновить env vars

Vercel Dashboard → твой проект fl-site → **Settings → Environment Variables**.

### 3.1 Добавить новую переменную

| Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAA...` (Site Key из Turnstile) | Production, Preview |

Для Development можно не выставлять — тогда в локальном dev капчи не будет и форма останется работоспособной.

### 3.2 Проверить существующие переменные

Убедись, что эти уже заданы в Production (если нет — они вызовут ошибку на старте после деплоя, потому что я убрал localhost fallback):

| Name | Откуда | Почему важна |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API | уже есть, должна быть |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API | уже есть, должна быть |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API (⚠️ секретный!) | нужен для server actions и admin clients |
| `NEXT_PUBLIC_API_URL` | URL твоего Express-сервера (`https://api.festivalullupilor.md` или что у тебя) | **критично** — без этого сборка упадёт в проде |
| `ADMIN_API_KEY` | shared secret с Express-сервером | **критично** — админ-роуты упадут без него |

Если `NEXT_PUBLIC_API_URL` не задан в Vercel — **добавь его** прежде чем деплоить, иначе Next.js упадёт при импорте `@/lib/env` с ошибкой `Missing required environment variable in production: NEXT_PUBLIC_API_URL`. Это намеренно (fail-fast вместо тихого падения в `localhost:3001`).

### 3.3 Ротировать `ADMIN_API_KEY` (пункт #7 из fixplan)

Это нужно делать синхронно в **двух местах**:

1. На сервере Express (`/server`) — где бы он ни хостился (VPS, Railway, Fly, etc.). В его `.env` / secret manager:
   ```
   ADMIN_API_KEY=<новый-сильный-секрет>
   ```
   Перезапустить Express-процесс, чтобы он подхватил новую переменную.

2. В Vercel env vars проекта fl-site — заменить старое значение на то же самое новое.

Генерация нового ключа:
```bash
openssl rand -hex 32
# или
python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
```

**Порядок действий критичен** (не перепутай):
1. Сгенерируй новый ключ.
2. Обнови его на **Express** сервере → перезапусти процесс.
3. Сразу после этого обнови в **Vercel** → Redeploy (или подожди следующий деплой).

Между шагами 2 и 3 любой запрос Next.js → Express будет получать 401 (старый ключ больше не работает, новый ещё не в Vercel). Поэтому **делай в нерабочее время**, и быстро, или наоборот — обнови сначала Vercel (оба сервера поддерживают старый ключ пока), потом Express. Но Express не поддерживает "два ключа одновременно" в текущей реализации — значит между 2 и 3 будет короткое окно даунтайма admin API. Это ок на 30 секунд, не ок на 5 минут.

Альтернатива: временно прописать на Express оба ключа (старый + новый), выкатить, обновить Vercel, потом на Express оставить только новый. Это требует мелкой правки middleware (`apiKeyAuth` должен принимать список ключей). Если задержка в 30-60 секунд недопустима — скажи мне, сделаю эту правку.

---

## 4. Deploy и smoke-test

### 4.1 Деплой

Запушь изменения в main (или в твою prod-ветку). Vercel соберёт и выкатит автоматически.

### 4.2 Что проверить **сразу после деплоя**

**Тест A — публичный сайт работает:**
- Открыть главную в инкогнито → должна загрузиться.
- Страницу билетов → кнопка «Купить» работает, checkout открывается, POST идёт на правильный `API_URL`.
- Сетевая вкладка (F12 → Network) → убедиться, что запросы летят на **реальный** `https://api.<твой-домен>`, а не на `localhost:3001`. Если видишь `localhost:3001` в проде — значит `NEXT_PUBLIC_API_URL` не добавлен в Vercel.

**Тест B — админка без капчи (если пока не включил Turnstile):**
- `/admin/login` → ввести креды админа → войти.
- Пройтись по 3-4 страницам админки, убедиться что данные подгружаются.

**Тест C — админка с капчей (после включения Turnstile):**
- `/admin/login` в инкогнито → должен появиться widget Turnstile под полем пароля.
- Если widget не появился — проверь консоль браузера. Возможные причины:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` не задан в Vercel → обнови env + Redeploy.
  - Site key не для этого домена → проверь Hostnames в Turnstile dashboard.
- Пройти challenge → кнопка «Войти» станет активной → войти.
- Попробовать войти с неправильным паролем → после ошибки widget должен сам сброситься (мой код вызывает `turnstile.reset()` при ошибке).

**Тест D — Supabase отбивает попытки без капчи:**
- Открыть DevTools console на `/admin/login` → выполнить руками:
  ```js
  const r = await fetch(
    'https://ybumbbtackrfdhijvfkz.supabase.co/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      headers: {
        'apikey': '<твой NEXT_PUBLIC_SUPABASE_ANON_KEY>',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'xxx' })
    }
  );
  console.log(r.status, await r.text());
  ```
  Ожидаемый ответ: `400` с сообщением `captcha verification process failed` или аналогичным. Это доказывает, что Supabase действительно требует captcha на auth (то есть раздел 1.3 применился).

**Тест E — ротация ADMIN_API_KEY:**
- После ротации → зайти в админку → открыть любую страницу, которая дёргает admin-роут (например, `/admin` с дашборд-счётчиками или `/admin/invitations`).
- Если видишь `502`/`503`/`401` — значит Express и Next.js разошлись по ключу. Перепроверь, что обе стороны получили один и тот же новый ключ.

---

## 5. Что НЕ делаем в Фазе 2

- **MFA для админов** — отдельная большая фича (TOTP enrollment UI + challenge flow). Перенесено в Фазу 3.
- **Нормализация `customer_email` в lowercase при записи** — полезно, но не срочно. Фаза 3.
- **`user_id` в `orders` вместо `customer_email`** — архитектурное улучшение, не security-fix. Фаза 3.
- **Scanner токены с коротким TTL + rotation** — в `fixplan.md` помечено как LOW, отложено.

---

## Сводка: что в этом коммите

| Файл | Изменение |
|---|---|
| `src/lib/env.ts` | **новый** — централизованный модуль валидации env, fail-fast в проде |
| `src/components/Turnstile.tsx` | **новый** — изолированный widget без внешних npm-зависимостей |
| `src/app/admin/login/page.tsx` | captcha + блокировка кнопки без токена + сброс токена при ошибке |
| `src/lib/api.ts` | импорт API_URL из `@/lib/env` |
| `src/components/B2BOrderSection.tsx` | то же |
| `src/components/admin/B2BOrderActions.tsx` | то же |
| `src/app/admin/(dashboard)/invitations/InvitationsTable.tsx` | то же |
| `src/app/admin/(dashboard)/orders/OrdersTable.tsx` | то же |
| `src/app/admin/(dashboard)/orders/[id]/OrderPageClient.tsx` | то же |
| `src/app/api/admin/**/*.ts` (12 файлов) | импорт API_URL + `getAdminApiKey()` вместо локальных const |

Зависимостей **не добавлено**. Сборка проверена (`tsc --noEmit` чистый).
